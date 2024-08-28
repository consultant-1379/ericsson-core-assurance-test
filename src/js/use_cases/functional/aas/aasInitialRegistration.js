/*jshint esversion: 6 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';

import {
  SCHEMA_TYPE_AVRO,
  SchemaRegistry
} from "k6/x/kafka"; // import kafka extensions

import { setupKafka, closeKafkaConnections } from '../../../modules/kafka_utils.js';
import { augSendRegistration } from './aasRegistration.js';
import { AAS, SR_URL, SRtlsConfig } from '../../../modules/const.js';
import { registerData } from '../../../modules/datasets/aas/aasRequestBody.js';
import { setRopStartAndEndTimestamp } from '../../../modules/pmsch/pmschAasPmDataIngest.js';

const schemaRegistry = new SchemaRegistry({url: SR_URL, tls: SRtlsConfig});

/* augmentationInitialRegistration
 * Initial Augmentation registration
 */

export function augmentationInitialRegistration(){
  //variables for kafka
  let inWriter, connection, outReader;
  [connection, inWriter, outReader] = setupKafka(AAS.inTopicName, AAS.outTopicName);

  connection.createTopic({
    topic: AAS.inTopicName,
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
     {
     configName: "min.insync.replicas",
     configValue: "1",
     },
    ],
  });

  const results = connection.listTopics();
  if(!results.includes(AAS.inTopicName))
  {
    console.error("The list of kafka topics does not include newly created topic.");
  }

  group('Augmentation Registration', function(){

    const regRes = augSendRegistration (registerData, "ADD");

    let result = check (regRes, {
      'Augmentation registration (status: 201)': (r) => r.status === 201
    });

    if (!result) {
      console.error("Augmentation registration failed with status: " + regRes.status);
    }
    else {
      console.log("Augmentation registration status is " + regRes.status);
    }

    // Augmentation Service will generate a new AVRO schema for our output kafka stream.
    // We will request the schema from the Schema Registry and then using the information
    // in that schema, we will request the meta data from the Data Catalogue.

    sleep (30);  //sleep to give AAS time to get all it's registration work done.

    // Find augmented schema based on subject and schema
    // This will get latest version
    let augSRSchemaData = schemaRegistry.getSchema ({
      subject: "AMF.Core.PM_COUNTERS.aecardq_AMF_Mobility_NetworkSlice_1"
    });

    try {
      let augmentedSchema = JSON.stringify(augSRSchemaData.schema);
    }
    catch(error) {
      console.error(`Cannot parse augmented schema from SR, error: ${error}`);
    }

    console.log("Augmented SR schema name is " + JSON.parse(augSRSchemaData.schema).name);

    try {
    result = check (JSON.parse(augSRSchemaData.schema), {
      'Verify Augmented SR Schema Name ': (r) => r.name == "aecardq_AMF_Mobility_NetworkSlice_1"
    });
    }
    catch(error) {
      console.error(`Cannot parse augmented schema for aecardq_AMF_Mobility_NetworkSlice_1, error: ${error}`);
    }

    // Get the schema metadata from the data catalog
    const dc_getByDatatypeUrl = AAS.catalogBaseUrl + AAS.dcGetEndpoint;

    const augDCSchemaData = http.get(dc_getByDatatypeUrl, {
    headers: { 'Content-Type': 'application/json' }
    });

    if (augDCSchemaData.status != 200)
      console.error("Read catalog data returned unexpected response " + augDCSchemaData.status + ".\n Response body: " + augDCSchemaData.body);

    try {
      check(augDCSchemaData, {
      'Get augmented DC data (status: 200)': (r) => r.status === 200
    });
    }
    catch(error) {
      console.error(`Augmented DC data status is not 200, error: ${error}`);
    }

    let augmentedDcData;
    try {
      augmentedDcData = JSON.parse(augDCSchemaData.body);
    }
    catch(error) {
      console.error(`Cannot parse DC data for augmented schema, error: ${error}`);
    }

    try {
      check(augmentedDcData, {
      'Verify augmented data topic name': augmentedDcData[0].messageSchema.messageDataTopic.name === AAS.outTopicName,
      'Verify augmented schema name': augmentedDcData[0].schemaName === 'aecardq_AMF_Mobility_NetworkSlice_1',
      });
    }
    catch(error) {
      console.error(`Verification of augmented data topic and schema name failed, error: ${error}`);
    }

    if (augmentedDcData[0].messageSchema.messageDataTopic.name != AAS.outTopicName)
      console.error("Unexpected topic name " + augmentedDcData[0].messageSchema.messageDataTopic.name);

    if (augmentedDcData[0].schemaName != 'aecardq_AMF_Mobility_NetworkSlice_1')
      console.error("Unexpected schema name " + augmentedDcData[0].schemaName);

      // sleep to ensure that once Aug registration is done, it has time to set up consumer for kafka before we write
        sleep(30);
    
        // Write a record to the input topic
        let srSchema = schemaRegistry.getSchema ({
          subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1"
        });
    
        let ropStartTime, ropEndTime;
        [ropStartTime, ropEndTime] = setRopStartAndEndTimestamp();
        ropStartTime = ropStartTime.toISOString().slice(0, 19);
        ropEndTime = ropEndTime.toISOString().slice(0, 19);
        try{
        let metricsRecord = [
          {
            value: schemaRegistry.serialize({
              data: {
                dnPrefix: { "string":"dnPrefix"},
                nodeFDN: "MeContext=PCG00032,ManagedElement=PCC00032",
                elementType: {"string":"PCC"},
                moFdn: "/system/mm/network-slice[snssai=9-3]",
                snssai: {"string":"9-3"},
                snssai_sst: {"string":"9"},
                snssai_sd: {"string":"3"},
                ropBeginTime: `${ropStartTime}`,
                ropEndTime: `${ropEndTime}`,
                suspect: {"boolean":false},
                apn: {"string":"apn1"},
                pmCounters: {"AMF.Core.PM_COUNTERS.pmMetricsSchema": {"VS_NS_NbrRegisteredSub_5GS": {"long": 15}}}
              },
              schema: srSchema,
              schemaType: SCHEMA_TYPE_AVRO
            }),
            headers: {
              subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1",
            },
          },
         {
            value: schemaRegistry.serialize({
              data: {
                dnPrefix: { "string":"dnPrefix"},
                nodeFDN: "MeContext=PCG00032,ManagedElement=PCC00032",
                elementType: {"string":"PCC"},
                moFdn: "/system/mm/network-slice[snssai=9-3]",
                snssai: {"string":"9-3"},
                snssai_sst: {"string":"9"},
                snssai_sd: {"string":"3"},
                ropBeginTime: `${ropStartTime}`,
                ropEndTime: `${ropEndTime}`,
                suspect: {"boolean":false},
                apn: {"string":"apn1"},
                pmCounters: {"AMF.Core.PM_COUNTERS.pmMetricsSchema": {"VS_NS_NbrRegisteredSub_5GS": {"long": 25}}}
              },
              schema: srSchema,
              schemaType: SCHEMA_TYPE_AVRO
            }),
            headers: {
              subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1",
            }
          }
        ];
    
        inWriter.produce({ messages: metricsRecord });
      }
    
         catch(error) {
          console.log(`Unexpected error while performing augmentation registration verification, error: ${error}`);
        }
        finally {
          closeKafkaConnections(connection, inWriter, outReader);
          }

    

  }); // End of Group Augmentation Registration

  // return the data provider id and bus id so the DC can be cleaned up for next run

} // end of function augmentationInitialRegistration
