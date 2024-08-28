import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SCHEMA_TYPE_AVRO, SchemaRegistry } from "k6/x/kafka";
import { AAS, SR_URL, SRtlsConfig } from '../../../modules/const.js';
import { closeKafkaConnections, setupKafka } from '../../../modules/kafka_utils.js';
import { augSendRegistration } from './aasRegistration.js';
import { deregisterData } from '../../../modules/datasets/aas/aasRequestBody.js';
import { setRopStartAndEndTimestamp } from '../../../modules/pmsch/pmschAasPmDataIngest.js';

const schemaRegistry = new SchemaRegistry({url: SR_URL, tls:SRtlsConfig});

export function augmentationDeregistration(aug_url){
  //variables for kafka
  let inWriter, outReader, connection;

  group('Augmentation Deregistration', function(){
    //setting up kafka topic
    [connection, inWriter, outReader] = setupKafka(AAS.inTopicName, AAS.outTopicName);

    group("Verify Augmentation Deregistration", function () {

      //Another augmentation registration aecard1 before deregistering aecardq       
      const regRes = augSendRegistration (deregisterData, "ADD");

      let result = check (regRes, {
        'Augmentation registration (status: 201)': (r) => r.status === 201
      });
  
      if (!result) {
        console.error("Augmentation registration failed with status: " + regRes.status);
      }
      else {
        console.log("Augmentation registration status is " + regRes.status);
      }
  
      // Deregistering the registered augmentation
      const deregistrationRes = http.del(AAS.url + AAS.deregisterEndpoint);

      const deregistrationResult = check(deregistrationRes, {
      'Check deregistration (status: 204)': (r) => r.status === 204
      });
      if (!deregistrationResult)
        console.error('Augmentation deregistration returned unexpected status ' + deregistrationRes.status + ".\n Response body: " + deregistrationRes.body);
    });
    sleep(30); //Deregistration to free AAS Kafka producers

    let srSchema = schemaRegistry.getSchema ({
      subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1"
    });
    
    let ropStartTime, ropEndTime;
    [ropStartTime, ropEndTime] = setRopStartAndEndTimestamp();
    ropStartTime = ropStartTime.toISOString().slice(0, 19);
    ropEndTime = ropEndTime.toISOString().slice(0, 19);

    try {
      let messages = [
        {
          value: schemaRegistry.serialize({
          data: {
            dnPrefix: {"string": "dnPrefix"},
            nodeFDN: "MeContext=PCG00032,ManagedElement=PCC00032",
            elementType: {"string": "PCC"},
            moFdn: "/system/mm/network-slice[snssai=9-3]",
            snssai: {"string": "9-3"},
            snssai_sst: {"string": "9"},
            snssai_sd: {"string": "3"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean": false},
            apn: {"string": "apn1"},
            pmCounters: {"AMF.Core.PM_COUNTERS.pmMetricsSchema": {"VS_NS_NbrRegisteredSub_5GS": {"long": 10}}
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
      inWriter.produce({ messages: messages });
      sleep(10);
  }

  catch(error){
    console.log(`Unexpected error while performing augmentation deregistration verification, error: ${error}`);
  }

  finally{
    closeKafkaConnections(connection, inWriter, outReader);
    //Deregister aecardq1 for post upgrade test phase
    http.del(AAS.url + AAS.deregisterAecarq1Endpoint);
  }
 });
}
