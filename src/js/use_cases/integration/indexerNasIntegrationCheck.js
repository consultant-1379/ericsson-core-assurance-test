import http from 'k6/http';
import { sleep } from "k6";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { AIS, SRtlsConfig, KFtlsConfig } from '../../modules/const.js';
import {
    Writer,
    Connection,
    SchemaRegistry,
    KEY,
    VALUE,
    TOPIC_NAME_STRATEGY,
    RECORD_NAME_STRATEGY,
    SCHEMA_TYPE_AVRO,
} from "k6/x/kafka"; // import kafka extensions

import { pmStatsMockKeySchema,
         soaNfNsiValueSchema,
         soaNfValueSchema,
         soaNsiValueSchema
        } from '../../modules/datasets/ais/indexBuildingConstants.js';
import { deregisterIndex, registerIndex } from '../../modules/ais/indexOperations.js'
import { verifyAssuranceSearchCanReachIndexer } from '../../modules/nas/assuranceSearchReachIndexer.js'

/**
 *  This function verifies the fullContexts response of a SearchEngine Index
 *  @param {NAS_URL} - The url of the Network Assurance Service micro-service
 */
export default function (NAS_URL) {
  try{
    // Verifying the fullContexts response of a SearchEngine Index
    verifyAssuranceSearchCanReachIndexer(NAS_URL);
  }
  catch(error) {
    console.error(`Verification of the fullcontexts response failed: ${error}`);
  }
}

/* * Setup for Indexer and NAS interaction
 *   Register an Index,
 *   Add Schema to SR, and 
 *   Send data on the Kafka
 * 
 *   @param {SR_URL} - The url of the Schema Registry service
 *   @param {KAFKA_URL} - The url of the Kafka broker service
 *   @param {AIS_URL} - The url of the Assurance Indexer micro-service
 */
export function indexerNasSetup(SR_URL, KAFKA_URL, AIS_URL) {
    const schemaRegistry = new SchemaRegistry({
        url: SR_URL,
        tls: SRtlsConfig,
    });
    const brokers = [KAFKA_URL];
    const connection = new Connection({
        address: brokers[0],
        tls:KFtlsConfig
    });
    connection.createTopic({ topic: AIS.soaTopicName });

    console.log("Setup in progress");

    let endpoint_url = AIS_URL + AIS.endpoint;
    const url_params = new URL(endpoint_url);
    url_params.searchParams.append('name', AIS.soaIndexName);

    // Register Index if it doesn't exist
    if((http.get(url_params.toString())).status != 200)
      registerIndex(AIS_URL, AIS.indexNasSpec);
      sleep (3);


    // Add schema to SR
    const [keySchemaObject1, valueSchemaObject1] = registerSchema(schemaRegistry, soaNfNsiValueSchema);
    const [keySchemaObject2, valueSchemaObject2] = registerSchema(schemaRegistry, soaNfValueSchema);
    const [keySchemaObject3, valueSchemaObject3] = registerSchema(schemaRegistry, soaNsiValueSchema);
    // Add logs
    console.log("Key Schema for keySchemaObject1 available in SchemaRegistry is " + JSON.stringify(keySchemaObject1));
    console.log("Value Schema for valueSchemaObject1 available in SchemaRegistry is " + JSON.stringify(valueSchemaObject1));
    console.log("Key Schema for keySchemaObject2 available in SchemaRegistry is " + JSON.stringify(keySchemaObject2));
    console.log("Value Schema for valueSchemaObject2 available in SchemaRegistry is " + JSON.stringify(valueSchemaObject2));
    console.log("Key Schema for keySchemaObject3 available in SchemaRegistry is " + JSON.stringify(keySchemaObject3));
    console.log("Value Schema for valueSchemaObject3 available in SchemaRegistry is " + JSON.stringify(valueSchemaObject3));

    // Send data using retrieved schema from SR to Kafka topic
    const writer = new Writer({
        brokers: brokers,
        topic: AIS.soaTopicName,
        autoCreateTopic: true,
        tls:KFtlsConfig
    });

    let messages = [
        {
            key: schemaRegistry.serialize({
                data: {
                    schema: "nfSchema",
                },
                schema: keySchemaObject2,
                schemaType: SCHEMA_TYPE_AVRO,
            }),
            value: schemaRegistry.serialize({
              data: {
                "NF": "AMF_ON",
                "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0": 10,
                "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5": 9,
                "aggregation_begin_time": "1212133444",
                "aggregation_end_time": "1212133455"
              },
                schema: valueSchemaObject2,
                schemaType: SCHEMA_TYPE_AVRO,
            }),
        },
        {
          key: schemaRegistry.serialize({
              data: {
                  schema: "schema",
              },
              schema: keySchemaObject3,
              schemaType: SCHEMA_TYPE_AVRO,
          }),
          value: schemaRegistry.serialize({
            data: {
              "NSI": "Slice1",
              "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0": 11,
              "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5": 99,
              "aggregation_begin_time": "1212133444",
              "aggregation_end_time": "1212133455"
            },
              schema: valueSchemaObject3,
              schemaType: SCHEMA_TYPE_AVRO,
          }),
      },
      {
        key: schemaRegistry.serialize({
            data: {
                schema: "schema",
            },
            schema: keySchemaObject1,
            schemaType: SCHEMA_TYPE_AVRO,
        }),
        value: schemaRegistry.serialize({
          data: {
            "NSI": "Slice1",
            "NF": "AMF_ON",
            "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0": 12,
            "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5": 8,
            "aggregation_begin_time": "1212133444",
            "aggregation_end_time": "1212133455"
          },
            schema: valueSchemaObject1,
            schemaType: SCHEMA_TYPE_AVRO,
        }),
    },
    ];
    writer.produce({ messages: messages });
    console.log("Avro Record is produced on the kafka topic " + AIS.soaTopicName); 
    sleep (10);

    console.log("Closing Kafka connections");
    if (connection) connection.close();
    if(writer) writer.close();

}

/* * Teardown for Indexer and NAS interaction
 *   De-Register an Index,
 * 
 *   @param {AIS_URL} - The url of the Assurance Indexer micro-service
 *   @param {IndexName} - Name of Index to be de-registered
 */
export function indexerNasTeardown(AIS_URL, IndexName) {

  console.log("Teardown in progress");

  // Deregistering the index registered above
  deregisterIndex(AIS_URL, AIS.soaIndexName);

}

/* * Register a schema in Schema Registry
 *
 *   @param {schemaRegistry} - Schema Registry object consisting SR url
 *   @param {valueSchema} - Value Schema object for nfnsischema, nfschema and nsischema
 *   @return {keySchemaObject} - Key Schema Object after schema is created to be used when writing Avro records
 *   @return {valueSchemaObject} - Value Schema Object after schema is created to be used when writing Avro records
 */

function registerSchema(schemaRegistry, valueSchema) {
    const keySubjectName = schemaRegistry.getSubjectName({
        topic: AIS.soaTopicName,
        element: KEY,
        subjectNameStrategy: TOPIC_NAME_STRATEGY,
        schema: pmStatsMockKeySchema,
    });

    const valueSubjectName = schemaRegistry.getSubjectName({
        topic: AIS.soaTopicName,
        element: VALUE,
        subjectNameStrategy: RECORD_NAME_STRATEGY,
        schema: valueSchema,
    });

    const keySchemaObject = schemaRegistry.createSchema({
        subject: keySubjectName,
        schema: pmStatsMockKeySchema,
        schemaType: SCHEMA_TYPE_AVRO,
    });

    const valueSchemaObject = schemaRegistry.createSchema({
        subject: valueSubjectName,
        schema: valueSchema,
        schemaType: SCHEMA_TYPE_AVRO,
    });
    return [keySchemaObject, valueSchemaObject];
}
