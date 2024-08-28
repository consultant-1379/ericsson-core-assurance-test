import { check, group, sleep } from "k6";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from "k6/http";
import {
    Writer,
    Reader,
    Connection,
    SchemaRegistry,
    KEY,
    VALUE,
    TOPIC_NAME_STRATEGY,
    RECORD_NAME_STRATEGY,
    SCHEMA_TYPE_AVRO
} from "k6/x/kafka"; // import kafka extensions

import { pmStatsMockKeySchema, pmStatsMockValueSchema } from '../../modules/datasets/ais/indexBuildingConstants.js';
import { deregisterIndex, registerIndex, verifyIndexExists, verifyIndexExistsInList } from '../../modules/ais/indexOperations.js'
import { searchEngineIndexList } from '../../modules/indexerSearchEngineIndexList.js';
import { searchEngineIndexFullContexts } from '../../modules/indexerFullContext.js';
import { getAndVerifyIndexValuesForFullContext } from '../../modules/indexerValuesForFullContext.js';
import { AIS, SRtlsConfig, KFtlsConfig } from '../../modules/const.js';
import { retryWrapper } from "../../modules/utils.js";

/* * Register and verify an index in Assurance Indexer application services
 * * Publish an Avro record on Kafka topic for Assurance Indexer application service to process and update the index
 * * Verify the updated index data in Opensearch
 * * Deregister index and verify deletion in Assurance Indexer application services
 *
 *   @param {url} - The url of the micro-service
 *   @param {SR_URL} - The url of the Schema Registry service
 *   @param {OS_URL} - The url of the Open Search service
 *   @param {KAFKA_URL} - The url of the Kafka broker service
 */
export default function (url, SR_URL, OS_URL, KAFKA_URL) {

    const schemaRegistry = new SchemaRegistry({
        url: SR_URL,
        tls: SRtlsConfig
    });
    const brokers = [KAFKA_URL];
    const connection = new Connection({
        address: brokers[0], tls: KFtlsConfig
    });
    connection.createTopic({ topic: AIS.topicName });

    group("Verify Index Registration, Building & Deregistration", function () {
        let endpoint_url = url + AIS.endpoint;
        let list_endpoint_url = url + AIS.listEndpoint;
        const url_params = new URL(endpoint_url);
        url_params.searchParams.append('name', AIS.indexName);

        // Registering an Index and temporary fix for passing post upgrade stage till ESOA-3342 is resolved
        // https://eteamproject.internal.ericsson.com/browse/ESOA-3342
        if((http.get(url_params.toString())).status != 200)
          registerIndex(url, AIS.indexSpec);
          sleep (3);

        // Verify successful registration
        verifyIndexExists(url, AIS.indexName);

        // Verify the list of indexes has the newly added index
        verifyIndexExistsInList(url, AIS.indexName);

        // Add schema to SR
        const [keySchemaObject, valueSchemaObject] = registerSchema(schemaRegistry);
        console.log("Key Schema available in SchemaRegistry is " + JSON.stringify(keySchemaObject));
        console.log("Value Schema available in SchemaRegistry is " + JSON.stringify(valueSchemaObject));

        // Send data using retrieved schema from SR to Kafka topic

        const writer = new Writer({
            brokers: brokers,
            topic: AIS.topicName,
            autoCreateTopic: true,
            tls: KFtlsConfig
        });
        const reader = new Reader({
            brokers: brokers,
            topic: AIS.topicName,
            tls: KFtlsConfig
        });

        let messages = [
            {
                key: schemaRegistry.serialize({
                    data: {
                        schema: "schema",
                    },
                    schema: keySchemaObject,
                    schemaType: SCHEMA_TYPE_AVRO,
                }),
                value: schemaRegistry.serialize({
                    data: {
                        "SNSSAI": "1:1",
                        "NF": "AMF_BC",
                        "Collection": "SITE:BC",
                        "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0": 10,
                        "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5": 99.0,
                        "aggregation_begin_time": 1212133444,
                        "aggregation_end_time": 1212133455
                    },
                    schema: valueSchemaObject,
                    schemaType: SCHEMA_TYPE_AVRO,
                }),
            },
        ];
        writer.produce({ messages: messages });
        console.log("Avro Record is produced on the kafka topic " + AIS.topicName); 
        sleep (10);
        
        // Verifying the search-engine-index-list response of a SearchEngine Index
        searchEngineIndexList(url, AIS.indexName);

        // Verifying the fullContexts response of a SearchEngine Index
        searchEngineIndexFullContexts(url, AIS.searchEngineIndexName);

        // Verifying the ValuesForFullContext response of a SearchEngine Index
        getAndVerifyIndexValuesForFullContext (url, AIS.searchEngineIndexName);

        // Deregistering the index registered above
        deregisterIndex(url, AIS.indexName);

        // Verify the list of indexes does not have the deregistered index with given no of retries and interval
        let retryStatus = retryWrapper(5, 10, verifyIndexExistsInList, url, AIS.indexName, false);
        let retryCheck = check(retryStatus, {
            ['Check list of indexes does not have the deregistered index is successful within the given retries']: (r) => r === true
        });
        if (!retryCheck)
            console.error('The retries are exhausted and deregistered index is still present in list');
    });
}

/* * Register a schema in Schema Registry
 *
 *   @param {schemaRegistry} - Schema Registry object consisting SR url
 *   @return {keySchemaObject} - Key Schema Object after schema is created to be used when writing Avro records
 *   @return {valueSchemaObject} - Value Schema Object after schema is created to be used when writing Avro records
 */

function registerSchema(schemaRegistry) {

    const keySubjectName = schemaRegistry.getSubjectName({
        topic: AIS.topicName,
        element: KEY,
        subjectNameStrategy: TOPIC_NAME_STRATEGY,
        schema: pmStatsMockKeySchema,
    });

    const valueSubjectName = schemaRegistry.getSubjectName({
        topic: AIS.topicName,
        element: VALUE,
        subjectNameStrategy: RECORD_NAME_STRATEGY,
        schema: pmStatsMockValueSchema,
    });

    const keySchemaObject = schemaRegistry.createSchema({
        subject: keySubjectName,
        schema: pmStatsMockKeySchema,
        schemaType: SCHEMA_TYPE_AVRO,
    });

    const valueSchemaObject = schemaRegistry.createSchema({
        subject: valueSubjectName,
        schema: pmStatsMockValueSchema,
        schemaType: SCHEMA_TYPE_AVRO,
    });
    return [keySchemaObject, valueSchemaObject];
}
