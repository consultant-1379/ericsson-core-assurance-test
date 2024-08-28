import { check, group, sleep } from 'k6';
import { SCHEMA_TYPE_AVRO, SchemaRegistry } from "k6/x/kafka";
import { setupKafka, closeKafkaConnections } from '../../../modules/kafka_utils.js';
import { AAS, SR_URL, SRtlsConfig } from '../../../modules/const.js';
import { augSendRegistration } from './aasRegistration.js';
import { setRopStartAndEndTimestamp } from '../../../modules/pmsch/pmschAasPmDataIngest.js';
import { updateData } from '../../../modules/datasets/aas/aasRequestBody.js';

const schemaRegistry = new SchemaRegistry({url: SR_URL, tls: SRtlsConfig});

/** augmentationUpdateRegistration
 * Updates an existing registered augmentation.
 */
export function augmentationUpdateRegistration(){

  group('Augmentation Update Registration', function(){

    //setting up kafka topic
    let connection, inWriter, outReader;
    [connection, inWriter, outReader] = setupKafka(AAS.inTopicName, AAS.outTopicName);

    const results = connection.listTopics();
    if(!results.includes(AAS.inTopicName)){
      console.error("The list of kafka topics does not include newly created topic.");
    }

    group("Verify Augmentation Update Registration", function () {
      // Register the update augmentation registration.
      let updateRegResponse = augSendRegistration (updateData, "UPDATE");

      let updateRegResult = check (updateRegResponse, {
        'Augmentation update registration (status: 200)': (r) => r.status === 200
      });

      if (!updateRegResult) {
        console.error("Augmentation update registration returned unexpected status " + updateRegResponse.status + ".\n Response body: " + updateRegResponse.body);
      }
    });

    sleep(30);
    let srSchema = schemaRegistry.getSchema ({
      subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1"
    });
    // Augmentation Service will generate a new AVRO schema and push it to output kafka stream.
    // Request the updated schema from the Schema Registry and then using the information
    // in that schema, request the meta data from the data catalog.
    let ropStartTime, ropEndTime;
    [ropStartTime, ropEndTime] = setRopStartAndEndTimestamp();
    ropStartTime = ropStartTime.toISOString().slice(0, 19);
    ropEndTime = ropEndTime.toISOString().slice(0, 19);

    try {
      let metricsRecord = [
        {
          value: schemaRegistry.serialize({
          data: {
            dnPrefix: {"string": "dnPrefix"},
            nodeFDN: "MeContext=PCG00032,ManagedElement=PCC00032",
            elementType: {"string": "PCC"},
            moFdn: "/system/mm/netowrk-slice[snssai=9-3]",
            snssai: {"string": "9-3"},
            snssai_sst: {"string": "9"},
            snssai_sd: {"string": "3"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean": false},
            apn: {"string": "apn1"},
            pmCounters: {"AMF.Core.PM_COUNTERS.pmMetricsSchema": {"VS_NS_NbrRegisteredSub_5GS": {"long": 10}},
            },
          },
          schema: srSchema,
          schemaType: SCHEMA_TYPE_AVRO,
            }),
          headers: {
            subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1",
          },
        },
      ];
      inWriter.produce({ messages: metricsRecord });
    }
    catch(error){
      console.log(`Unexpected error while performing update augmentation verification, error: ${error}`);
    }
    finally {
      closeKafkaConnections(connection, inWriter, outReader);
    }
  });
}
