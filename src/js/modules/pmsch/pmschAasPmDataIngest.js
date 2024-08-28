import { sleep, check, group } from 'k6';
import { PM_STATS, AAS, SR_URL, SRtlsConfig, AIS, PM_KPI } from '../../modules/const.js';
import { setupKafka, closeKafkaConnections } from '../kafka_utils.js';
import { verifyKPISearchSuccess } from '../../modules/nas/nasDataVerificationFunctions.js';
import { getIndexerContextValue } from '../../modules/ais/aisKpiDataVerification.js';

import {
  SCHEMA_TYPE_AVRO,
  SchemaRegistry
} from "k6/x/kafka"; // import kafka extensions

const schemaRegistry = new SchemaRegistry({url: SR_URL,tls:SRtlsConfig,});
let connectionCore, inWriterCoreTopic, outReaderCoreTopic;
let connectionRan, inWriterRanTopic, outReaderRanTopic;
let connectionCoreAug, inWriterCoreTopicAug, outReaderCoreTopicAug;

let ropStartInTime, ropEndInTime;
[ropStartInTime, ropEndInTime] = setRopStartAndEndTimestamp();
export const calcBeginTimestamp = Date.parse(ropStartInTime)/1000;
export const calcEndTimestamp = Date.parse(ropEndInTime)/1000;

ropStartInTime = ropStartInTime.toISOString().slice(0, 19);
ropEndInTime = ropEndInTime.toISOString().slice(0, 19);

/**
 *   setRopStartAndEndTimestamp()
 *   This function is used to calculate rop start and end timestamp based on current timestamp
 *   Sets Rop start and end time based on current timestamp for pm counter data
 *   @return {ropBeginTime} - Rop start time in utc format
 *   @return {ropEndTime} - Rop End time in utc format
 */
export function setRopStartAndEndTimestamp()
{
  const currentDate = new Date();
  const getHours = currentDate.getUTCHours();
  const getMinutes = currentDate.getUTCMinutes();
  let ropBeginTime, ropEndTime;

  if (0 <= getMinutes && getMinutes < 15)
  {
    ropBeginTime = new Date(currentDate.setMinutes(0));
    ropBeginTime = new Date(currentDate.setSeconds(0));
    ropEndTime = new Date(currentDate.setMinutes(15));
    ropEndTime = new Date(currentDate.setSeconds(0));
  }
  else if (15 <= getMinutes && getMinutes < 30)
  {
    ropBeginTime = new Date(currentDate.setMinutes(15));
    ropBeginTime = new Date(currentDate.setSeconds(0));
    ropEndTime = new Date(currentDate.setMinutes(30));
    ropEndTime = new Date(currentDate.setSeconds(0));
  }
  else if (30 <= getMinutes && getMinutes < 45)
  {
    ropBeginTime = new Date(currentDate.setMinutes(30));
    ropBeginTime = new Date(currentDate.setSeconds(0));
    ropEndTime = new Date(currentDate.setMinutes(45));
    ropEndTime = new Date(currentDate.setSeconds(0));
  }
  else
  {
    ropBeginTime = new Date(currentDate.setMinutes(45));
    ropBeginTime = new Date(currentDate.setSeconds(0));
    const setHour = currentDate.setHours(getHours+1);
    ropEndTime = new Date(currentDate.setMinutes(0));
    ropEndTime = new Date(currentDate.setSeconds(0));
  }
  return [ropBeginTime, ropEndTime];
}

/** pmschAasPmDataIngest()
 *  Creates input and output pmsch topics and sends pm counter data.
 */
export function pmschAasPmDataIngest()
{
  let ingestSuccess=false;
  group("Ingest PM Counters and setup kafka", function(){
    try{
      // Creating Kafka Topic for sending Non Augmented Core Data
      [connectionCore, inWriterCoreTopic, outReaderCoreTopic]= setupKafka(PM_STATS.inTopicName, PM_STATS.outTopicName);

      // Creating Kafka Topic for sending Augmented Ran Data
      [connectionRan, inWriterRanTopic, outReaderRanTopic]= setupKafka(AAS.ebsnInTopicName, AAS.outTopicName);

      // Creating Kafka Topic for sending Augmented Core Data
      [connectionCoreAug, inWriterCoreTopicAug, outReaderCoreTopicAug]= setupKafka(AAS.inTopicName, AAS.outTopicName);

      //Adding a sleep of 3 minutes to allow AAS to make stable connection with Kafka and the send data
      sleep(180);

      if (PM_KPI.KPI_DATA_TYPE == "Core") {
        // Write a record to the input topic for Non Aug Core Pm Counter for PDUSessionEstSR kpi
        sendNonAugCorePmCounters (ropStartInTime, ropEndInTime, inWriterCoreTopic);
        // Ingest pm counters for AMFMaxRegNbr and AMFMeanRegNbr kpis
        sendAugCorePmCounters (ropStartInTime, ropEndInTime, inWriterCoreTopicAug);
      }
      else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
        // Write a record to the input topic for Aug Ran Pm Counter for DlUeThroughput kpi
        sendAugRanPmCounters (ropStartInTime, ropEndInTime, inWriterRanTopic);
      }
      else {
        // Write a record to the input topic for Non Aug Core Pm Counter for PDUSessionEstSR kpi
        sendNonAugCorePmCounters (ropStartInTime, ropEndInTime, inWriterCoreTopic);

        // Write a record to the input topic for Aug Ran Pm Counter for DlUeThroughput kpi
        sendAugRanPmCounters (ropStartInTime, ropEndInTime, inWriterRanTopic);

        // Ingest pm counters for AMFMaxRegNbr and AMFMeanRegNbr kpis
        sendAugCorePmCounters (ropStartInTime, ropEndInTime, inWriterCoreTopicAug);
      }

      closePMSCHKafkaConnections();

      console.log("Record written, now adding some sleep for pmsch to calculate kpi's");
      ingestSuccess= true;
      sleep(4200);   // Giving 70 mins of wait time for pmsch to calculate the simple and complex kpi's

    }
    catch(error){
      console.error(`Unexpected error while ingesting pm counter data ${error}`);
    }
    finally{
      check(ingestSuccess, {
        "Check PM Counter ingest": (ingestSuccess) => ingestSuccess == true
      });
    }
  });
}

/** sendNonAugCorePmCounters()
 *  Sends unaugmented pm counter data directly to pmsch
 *  @param {ropStartTime} - Rop start time in utc format
 *  @param {ropEndTime} - Rop End time in utc format
 *  @param {inWriter} - Input topic object for sending pm counters
 */
export function sendNonAugCorePmCounters(ropStartTime, ropEndTime, inWriter)
{
    let nonAugSRSchemaData = schemaRegistry.getSchema ({
      subject: "SMF.Core.PM_COUNTERS.smf_nsmf_pdu_session_snssai_apn_1"
    });
    console.log(JSON.stringify(nonAugSRSchemaData.schema));
    let metricsRecord = [
      { //PDUSessionEstSR, PDUSesMaxNbr, PDUSesMeanNbr
        value: schemaRegistry.serialize({
          data: {
            dnPrefix: { "string":"dnPrefix"},
            nodeFDN: "MeContext=PCC00020,ManagedElement=PCC00020",
            elementType: {"string":"PCC"},
            moFdn: "/system/nsmf/pdu-session-snssai-apn[snssai=1-1]",
            snssai: {"string":"1-1"},
            snssai_sst: {"string":"1"},
            snssai_sd: {"string":"1"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean":false},
            apn: {"string":"apn1"},
            pmCounters: {"SMF.Core.PM_COUNTERS.pmMetricsSchema": {
              "create_sm_context_req": {"long": 20},
              "create_sm_context_resp_succ": {"long": 30}}}
          },
          schema: nonAugSRSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "SMF.Core.PM_COUNTERS.smf_nsmf_pdu_session_snssai_apn_1"
        }
      },
    ];
    inWriter.produce({ messages: metricsRecord });
}

/**  sendAugRanPmCounters()
 *   This function is used to send ran pm counter data on input kafka topic of AAS
 *   @param {ropStartTime} - Rop start time in utc format
 *   @param {ropEndTime} - Rop End time in utc format
 *   @param {inWriter} - Input topic object for sending pm counters
 */
export function sendAugRanPmCounters(ropStartTime, ropEndTime, inWriter) {

    let ranPlmnidSnssaiSchemaData = schemaRegistry.getSchema ({
      subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_PLMNID_SNSSAI_1"
    });
    let ranPlmnidQosSnssaiSchemaData = schemaRegistry.getSchema ({
        subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_PLMNID_QOS_SNSSAI_1",
    });
    let ranEbsn_1SchemaData = schemaRegistry.getSchema ({
        subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_1"
    });
    let ranEbsnQosSchemaData = schemaRegistry.getSchema ({
      subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_QOS_1",
    });
    console.log(JSON.stringify(ranPlmnidSnssaiSchemaData.schema));
    console.log(JSON.stringify(ranPlmnidQosSnssaiSchemaData.schema));
    console.log(JSON.stringify(ranEbsn_1SchemaData.schema));
    console.log(JSON.stringify(ranEbsnQosSchemaData.schema));
    let metricsRecord = [
      {
        value: schemaRegistry.serialize({
          data: {
            ossid: null,
            elementType: null,
            measObjLdn: "ManagedElement=gNBh96Mac02,GNBDUFunction=1,NRCellDU=1",
            qos: "5",
            localDn: "SubNetwork=RAN,MeContext=gNBh96Mac02,ManagedElement=gNBh96Mac02",
            snssai: "1-10",
            ropBeginTimeInEpoch: 1704867873,
            ropEndTimeInEpoch: 1704867973,
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            dnPrefix: null,
            suspect: false,
            plmnId: "808-81",
            managedElement: "gNBh96Mac02",
            moType: {"string":"NRCellDU"},
            moValue: {"string":"1"},
            flexCounters: "mcc808mnc81_sst1sd10",
            pmCounters: {
              "pmEbsnMacTimeDlDrbQos": {"long": 100},             //DlUeThroughput
              "pmEbsnMacVolDlDrbQos": {"long": 200},              //DlUeThroughput
              "pmEbsnRlcDelayPktTransmitDlQos": {"long": 100},    //DLDelay_GnbDu
              "pmEbsnRlcDelayTimeDlQos": {"long": 200},           //DLDelay_GnbDu
              "pmEbsDrbEstabSucc5qi": {"long": 100},              //PartialDRBAccessibility
              "pmEbsDrbEstabAtt5qi": {"long": 200},               //PartialDRBAccessibility
            }
          },
          schema: ranPlmnidQosSnssaiSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_PLMNID_QOS_SNSSAI_1",
        },
      },
      {
        value: schemaRegistry.serialize({
          data: {
            ossid: null,
            measObjLdn: "ManagedElement=gNBh96Mac02,GNBDUFunction=1,NRCellDU=1",
            localDn: "SubNetwork=RAN,MeContext=gNBh96Mac02,ManagedElement=gNBh96Mac02",
            elementType: null,
            snssai: "1-10",
            ropBeginTimeInEpoch: 1704867873,
            ropEndTimeInEpoch: 1704867973,
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            dnPrefix: null,
            suspect: false,
            plmnId: "808-81",
            managedElement: "gNBh96Mac02",
            moType: {"string":"NRCellDU"},
            moValue: {"string":"1"},
            flexCounters: "mcc808mnc81_sst1sd10",
            pmCounters: {
              "pmEbsHoExeAttOutDrbEutran": {"long": 200},     //5GSEPHOSR
              "pmEbsHoExeSuccOutDrbEutran": {"long": 20},     //5GSEPHOSR
              "pmEbsHoPrepAttOutDrbEutran": {"long": 100},    //5GSEPHOSR
              "pmEbsHoPrepSuccOutDrbEutran": {"long": 25},    //5GSEPHOSR
              "pmEbsHoExeSuccOutDrbInterGnb": {"long": 300},  //GRANHOSR
              "pmEbsHoExeSuccOutDrbIntraGnb": {"long": 330},  //GRANHOSR
              "pmEbsHoExeAttOutDrbInterGnb": {"long": 600},   //GRANHOSR
              "pmEbsHoExeAttOutDrbIntraGnb": {"long": 660},   //GRANHOSR
              "pmEbsHoPrepSuccOutDrbInterGnb": {"long": 150}, //GRANHOSR
              "pmEbsHoPrepSuccOutDrbIntraGnb": {"long": 155}, //GRANHOSR
              "pmEbsHoPrepAttOutDrbInterGnb": {"long": 300},  //GRANHOSR
              "pmEbsHoPrepAttOutDrbIntraGnb": {"long": 310},  //GRANHOSR
              "pmEbsnMacVolUlResUe": {"long": 10},            //UlUeThroughput
              "pmEbsnMacTimeUlResUe": {"long": 20},           //UlUeThroughput
            }
          },
          schema: ranPlmnidSnssaiSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_PLMNID_SNSSAI_1",
        },
      },
      { //PartialDRBAccessibility
        value: schemaRegistry.serialize({
          data: {
            ossid: null,
            elementType: null,
            measObjLdn: "ManagedElement=gNBh96Mac02,GNBDUFunction=1,NRCellDU=1",
            localDn: "SubNetwork=RAN,MeContext=gNBh96Mac02,ManagedElement=gNBh96Mac02",
            ropBeginTimeInEpoch: 1704867873,
            ropEndTimeInEpoch: 1704867973,
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            dnPrefix: null,
            suspect: false,
            managedElement: "gNBh96Mac02",
            moType: {"string":"NRCellDU"},
            moValue: {"string":"1"},
            flexCounters: {"string":"mcc808mnc81_sst1sd10"},
            pmCounters: {
              "pmEbsNgSigConnEstabAtt": {"long": 200},
              "pmEbsNgSigConnEstabSucc": {"long": 100},
              "pmEbsRrcConnEstabAtt": {"long": 200},
              "pmEbsRrcConnEstabSucc": {"long": 100},
            },
          },
          schema: ranEbsn_1SchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_1",
        },
      },
      {
        value: schemaRegistry.serialize({
          data: {
            ossid: null,
            measObjLdn: "ManagedElement=gNBh96Mac02,GNBDUFunction=1,NRCellDU=1",
            localDn: "SubNetwork=RAN,MeContext=gNBh96Mac02,ManagedElement=gNBh96Mac02",
            elementType: null,
            ropBeginTimeInEpoch: 1704867873,
            ropEndTimeInEpoch: 1704867973,
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            dnPrefix: null,
            suspect: false,
            qos: "5",
            managedElement: "gNBh96Mac02",
            moType: {"string":"NRCellDU"},
            moValue: {"string":"1"},
            flexCounters: {"string":"mcc808mnc81_sst1sd10"},
            pmCounters: {
              "pmEbsMacLatTimeDlDrxSyncQos": {"long": 25500},//DLLat_gNB_DU
              "pmEbsMacLatTimeDlNoDrxSyncQos": {"long": 25600},//DLLat_gNB_DU
              "pmEbsMacLatTimeDlDrxSyncSampQos": {"long": 80000},//DLLat_gNB_DU
              "pmEbsMacLatTimeDlNoDrxSyncSampQos": {"long": 80000},//DLLat_gNB_DU
              }
          },
          schema: ranEbsnQosSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "EBSN.RAN.PM_COUNTERS.PM_EBSN_QOS_1",
        },
      },
    ];
    inWriter.produce({ messages: metricsRecord });
}

/**  sendCorePmCounters()
 *   This function is used to send core pm counter data on input kafka topic of AAS
 *   @param {ropStartTime} - Rop start time in utc format
 *   @param {ropEndTime} - Rop End time in utc format
 *   @param {inWriter} - Input topic object for sending pm counters
 */
export function sendCorePmCounters(ropStartTime, ropEndTime, inWriter) {

  let coreSRSchemaData = schemaRegistry.getSchema ({
    subject: "UPF.Core.PM_COUNTERS.up_payload_dnn_slice_1"
  });
  console.log(JSON.stringify(coreSRSchemaData.schema));
  // Data for Core KPI UGTPTN
  let metricsRecord = [
    {
       value: schemaRegistry.serialize({
       data: {
         dnPrefix: {"string":""},
         nodeFDN: "MeContext=PCG00031,ManagedElement=PCC00031",
         elementType: null,
         moFdn: "/pcupe:user-plane/pcupdnn:dnns/pcupdnn:dnn[name=dnnA.ericsson.se]/pcupdnn:slices/pcupdnn:slice[name=1-000001]",
         snssai: {"string":"5-1"},
         snssai_sst: {"string":"5"},
         snssai_sd: {"string":"1"},
         ropBeginTime: `${ropStartTime}`,
         ropEndTime: `${ropEndTime}`,
         suspect: {"boolean":false},
         apn: {"string":"dnnA.ericsson.se"},
         pmCounters: {
           "UPF.Core.PM_COUNTERS.pmMetricsSchema": {
           "ul_ipv4_received_bytes": {"long": 26500},
           "ul_ipv6_received_bytes": {"long": 2650},
           "ul_unstr_received_bytes": {"long": 265}}
           }
         },
         schema: coreSRSchemaData,
         schemaType: SCHEMA_TYPE_AVRO
         }),
         headers: {
           subject: "UPF.Core.PM_COUNTERS.up_payload_dnn_slice_1"
         },
       }
    ];
  inWriter.produce({ messages: metricsRecord });
}

/**  sendAugCorePmCounters()
 *   This function is used to send core pm counter data on input kafka topic of AAS to augment records
 *   @param {ropStartTime} - Rop start time in utc format
 *   @param {ropEndTime} - Rop End time in utc format
 *   @param {inWriter} - Input topic object for sending pm counters
 */
export function sendAugCorePmCounters(ropStartTime, ropEndTime, inWriter) {

    // Write a record to the input topic
    let AMF_Mobility_NetworkSlice_1SRSchemaData = schemaRegistry.getSchema ({
      subject: "AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1"
    });

    // Write up_payload_dnn_slice_1 records to the input topic
    let up_payload_dnn_slice_1SRSchemaData = schemaRegistry.getSchema ({
      subject: "UPF.Core.PM_COUNTERS.up_payload_dnn_slice_1"
    });

    // Write smf_session_management_n1_snssai_apn_1 record to the input topic
    let pduSessModSRSchemaData = schemaRegistry.getSchema ({
      subject: "SMF.Core.PM_COUNTERS.smf_session_management_n1_snssai_apn_1"
    });

    // Write up_pfcp_procedure_dnn_slice_1 record to the input topic
    let uppcpfProcDnnSliceSchemaData = schemaRegistry.getSchema ({ 
      subject: "UPF.Core.PM_COUNTERS.up_pfcp_procedure_dnn_slice_1"
    });

    console.log(JSON.stringify(AMF_Mobility_NetworkSlice_1SRSchemaData));
    console.log(JSON.stringify(up_payload_dnn_slice_1SRSchemaData));
    console.log(JSON.stringify(pduSessModSRSchemaData.schema));
    console.log(JSON.stringify(uppcpfProcDnnSliceSchemaData.schema));

    let metricsRecord = [
      {
        value: schemaRegistry.serialize({
          data: {
            "dnPrefix": {"string":"dnPrefix"},
            "nodeFDN": "MeContext=PCC00011,ManagedElement=PCC00011",
            "elementType": {"string":"PCC"},
            "moFdn": "/system/mm/network-slice[snssai=83-5]",
            "snssai": {"string":"83-5"},
            "snssai_sst": {"string":"83"},
            "snssai_sd": {"string":"5"},
            "ropBeginTime": `${ropStartTime}`,
            "ropEndTime": `${ropEndTime}`,
            "suspect": {"boolean":false},
            "apn": {"string":"apn1"},
            pmCounters: {"AMF.Core.PM_COUNTERS.pmMetricsSchema": {
                "VS_NS_NbrRegisteredSub_5GS": {"long": 30}}   //AMFMeanRegNbr
            }
        },
          schema: AMF_Mobility_NetworkSlice_1SRSchemaData,
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
            elementType: {"string":"PCG"},
            moFdn: "/system/mm/network-slice[snssai=9-3]",
            snssai: {"string":"9-3"},
            snssai_sst: {"string":"9"},
            snssai_sd: {"string":"3"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean":false},
            apn: {"string":"apn1"},
            pmCounters: {"UPF.Core.PM_COUNTERS.pmMetricsSchema": {
                "dl_ipv4_received_bytes": {"long": 100000},     //DGTPTN, DTSNSI
                "dl_ipv6_received_bytes": {"long": 12000},      //DGTPTN, DTSNSI
                "dl_unstr_received_bytes": {"long": 500},       //DGTPTN, DTSNSI
                "ul_ipv4_received_bytes": {"long": 100000},     //UGTPTN, UTSNSI
                "ul_ipv6_received_bytes": {"long": 12000},      //UGTPTN, UTSNSI
                "ul_unstr_received_bytes": {"long": 500},       //UGTPTN, UTSNSI
                "ul_ipv4_drop_packets":{"long": 1000},          //ULIpv4PacketsDr
                "dl_ipv4_drop_packets":{"long": 500},           //DLIpv4PacketsDr
                "ul_ipv6_drop_packets":{"long": 1500},          //ULIpv6PacketsDr
                "dl_ipv6_drop_packets":{"long": 400},           //DLIpv6PacketsDr
                "dl_unstr_drop_packets":{"long": 300},          //DLUnstrPacketsDr
                "ul_unstr_drop_packets":{"long": 2000}          //DLUnstrPacketsDr
                }
            }
          },
          schema: up_payload_dnn_slice_1SRSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "UPF.Core.PM_COUNTERS.up_payload_dnn_slice_1",
        },
      },
      {  //PDUSessModSR
        value: schemaRegistry.serialize({
          data: {
            dnPrefix: { "string":"dnPrefix"},
            nodeFDN: "MeContext=PCC00020,ManagedElement=PCC00020",
            elementType: {"string":"PCC"},
            moFdn: "/system/mm/network-slice[snssai=3-1]",
            snssai: {"string":"3-1"},
            snssai_sst: {"string":"3"},
            snssai_sd: {"string":"1"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean":false},
            apn: {"string":"apn1"},
            pmCounters: {"SMF.Core.PM_COUNTERS.pmMetricsSchema": {
              "smf_modification_cmpl": {"long": 100},
              "smf_modification_cmd": {"long": 200}
              }
            }
          },
          schema: pduSessModSRSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "SMF.Core.PM_COUNTERS.smf_session_management_n1_snssai_apn_1",
        },
      },
      { 
        value: schemaRegistry.serialize({
          data: {
            dnPrefix: { "string":"dnPrefix"},
            nodeFDN: "MeContext=PCG00030,ManagedElement=PCC00030",
            elementType: {"string":"PCG"},
            moFdn: "/system/mm/network-slice[snssai=1-1]",
            snssai: {"string":"1-1"},
            snssai_sst: {"string":"1"},
            snssai_sd: {"string":"1"},
            ropBeginTime: `${ropStartTime}`,
            ropEndTime: `${ropEndTime}`,
            suspect: {"boolean":false},
            apn: {"string":"apn1"},
            pmCounters: {"UPF.Core.PM_COUNTERS.pmMetricsSchema": {
              "session_establishment_req_rcvd": {"long": 5}, "session_establishment_rsp_rej_sent": {"long": 10},  //PFCPSessEstFR
              "session_modification_req_rcvd": {"long": 5},"session_modification_rsp_rej_sent": {"long": 10}    //PFCPSessModFR
              }
            }
          },
          schema: uppcpfProcDnnSliceSchemaData,
          schemaType: SCHEMA_TYPE_AVRO
        }),
        headers: {
          subject: "UPF.Core.PM_COUNTERS.up_pfcp_procedure_dnn_slice_1",
        },
      },
    ];

  inWriter.produce({ messages: metricsRecord });

  console.log("Record written on Kafka successfully ");
}

/** closePMSCHKafkaConnections()
 *  Closing Non Aug and Ran Aug kafka connections
 */
export function closePMSCHKafkaConnections() {
  closeKafkaConnections(connectionCore, inWriterCoreTopic, outReaderCoreTopic);
  closeKafkaConnections(connectionRan, inWriterRanTopic, outReaderRanTopic);
  closeKafkaConnections(connectionCoreAug, inWriterCoreTopicAug, outReaderCoreTopicAug);
}

/** verifyKpiValueOnAISandNAS()
 *  Verify the full context value exists in indexer for all the context Id's
 *  Get the context value if contextId exists in indexer and than verify kpi metric value in NAS
 *  @param {contextIdsList} - contextIds can be a single value or a list of values to verify
 *  @param {kpiName} - Name of the kpi
 *  @param {expectedKpiValue} - Expected kpi value
 *  @param {aasIndexName} - Name of assurance indexer
 */
export function verifyKpiValueOnAISandNAS(contextIdsList, kpiName, expectedKpiValue, aasIndexName= AIS.oobIndexName) {
  let contextId, kpiValue;
  try {
    // AIS code verification
    for (let i= 0; i< contextIdsList.length; i++) {
      contextId = contextIdsList[i];
      if (typeof (expectedKpiValue) === "number") {
        kpiValue =  expectedKpiValue;
      }
      else {
        kpiValue = expectedKpiValue[i];
      }
      // Verifying the ValuesForFullContext response of a SearchEngine Index
      let augRanContextValue = getIndexerContextValue(aasIndexName, kpiName, contextId);
      const contextFound = check(augRanContextValue, {
        "Context ID found in AIS ": (r) => r != undefined
      })
      if(contextFound)
      {
        verifyKPISearchSuccess(aasIndexName, contextId, augRanContextValue, kpiValue, calcBeginTimestamp, calcEndTimestamp);
      }
    }
  }
  catch (error) {
    console.error(`Verification of Kpi Data on AIS failed with unexpected error: ${error} for kpiName: ${kpiName}`);
  }
}
