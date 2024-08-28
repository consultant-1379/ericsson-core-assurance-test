import { TLS_1_2 } from "k6/x/kafka";
import {
    ctsCreateEventProduceMessage,
    ctsUpdateEventProduceMessage,
    ctsDeleteEventProduceMessage,
    plmn1CreateMssage,
    plmn2Createmessage,
    nrCellCreateWithPlmn1AndPlmn2LinkMessage,
    nrCellUpdateLinkMessage,
    nrCellDeleteMessage,
    plmn1DeleteMessage,
    plmn2DeleteMessage
} from '../modules/datasets/atn/atnCTSMessages.js';

import * as aasSchema from '../modules/aas/aasSchema.js';
import * as aasInfoRequest from '../modules/datasets/aas/aasInfoRequest.js';

export const HEALTH = {
    endpoint: '/actuator/health',
    nasHealthEndpoint: '/status',
    pmCalcEndpoint: '/kpi-handling/calculator-service/health',
    neo4jHealthEndpoint: '/db/neo4j/cluster/available',
    atnHealthReadinessEndpoint: '/actuator/health/readiness',
    atnHealthLivenessEndpoint: '/actuator/health/liveness',
};

export const PROMETHEUS = {
    endpoint: '/actuator/prometheus'
};
export const KAFKA_SERVER_URL = `${__ENV.KAFKA_URL}`;//example 'http://eric-oss-dmm-kf-op-sz-kafka-bootstrap:9092',
export const ADP_KAFKA_URL = `${__ENV.ADP_KAFKA_URL}`; //example:'eric-esoa-platform-message-bus-kf-client:9092'
export const SR_URL = `${__ENV.SR_URL}`; // example:'http://eric-schema-registry-sr:8081'
export const OS_URL = `${__ENV.OPENSEARCH_URL}`; //example:'http://eric-data-search-engine:9200'
export const PMSERVER_URL = `${__ENV.PMSERVER_URL}`; //example:'https://eric-pm-server:9089'


export const ATN = {
    url: `${__ENV.ATN_URL}`, //example:'http://eric-bos-assurance-topology-notification:8080'
    metrics: [
        'atn_cts_evt_processed_success_total',
        'atn_cts_evt_processed_error_total',
        'atn_cts_evt_ignored_total',
        'atn_cts_evt_association_total',
        'atn_cts_evt_object_total',
        'atn_cts_evt_outdated_total'
    ],
    slo_metrics_values: [
        ['assurance_topology_notification_application_started_time_seconds', '120']
    ],
    ctsEventTopic: "cts-topology-change-events",
    topologyEventTopic: "topology-change-event-topic",
    createCTSmessage: ctsCreateEventProduceMessage,
    updateCTSmessage: ctsUpdateEventProduceMessage,
    deleteCTSmessage: ctsDeleteEventProduceMessage,
    createPlmn1Message: plmn1CreateMssage,
    createPlmn2Message: plmn2Createmessage,
    createNrCellWithPlmn1AndPlmn2LinkMessage: nrCellCreateWithPlmn1AndPlmn2LinkMessage,
    updateNrCellMessage: nrCellUpdateLinkMessage,
    deleteNrCellMessage: nrCellDeleteMessage,
    deletePlmn1Message: plmn1DeleteMessage,
    deletePlmn2Message: plmn2DeleteMessage,
    createEventId: "6fd3a9c5-e571-4d46-b6c5-5bef0d6e027c",
    updateEventId: "6cfd1f1e-89b8-47b6-84f7-2f86c12f922c",
    deleteEventId: "bc4468f8-7bd1-471f-9d0b-769700217cbe",
    eventTypeCreate: "ctsCreateEvent",
    eventTypeUpdate: "ctsUpdateEvent",
    eventTypeDelete: "ctsDeleteEvent",
};

export const AIS = {
    url: `${__ENV.AIS_URL}`, //example:'http://eric-oss-assurance-indexer:8080'
    endpoint: "/v1/indexer-info/indexer",
    indexValuesEndpoint: '/v1/indexer-info/spec/values-for-fullcontext',
    listEndpoint: "/v1/indexer-info/indexer-list",
    searchEngineEndpoint: "/v1/indexer-info/search-engine-index-list",
    fullContextsEndpoint: "/v1/indexer-info/spec/fullcontexts",
    indexSpec: JSON.parse(open('../modules/datasets/ais/index_building_specification.json')),
    indexNasSpec: JSON.parse(open('../modules/datasets/ais/indexer_nas_specification.json')),
    indexName: "ESOA-Test-Indexer",
    soaIndexName: "assurance-soa-indexer-for-ui-testing",
    fullContextName: 'NF_SITE_SNSSAI',
    searchEngineIndexName: "assurance-index-a",
    topicName: "pm-stats-calc-handling-avro-scheduled",
    soaTopicName: "soa-topic",
    metrics: [
        'ais_index_records_received_total',
        'ais_index_records_processed_total',
        'ais_startup_time_seconds'
    ],
    assuranceIndexName: "ESOA-2-Indexer",
    oobIndexName: "assurance-index-oob",
    gtpPacketsContextId: ["nodeFDN", "nssi", "site", "nssi_site"],
    ugtptnKpiName: "UGTPTN",
    utsnsiName: "UTSNSI",
    dtsnsiName: "DTSNSI",
    dgtptnName: "DGTPTN",
    amfMaxRegNbrName: "AMFMaxRegNbr",
    amfMeanRegNbrName: "AMFMeanRegNbr",
    pduSessionEstSrName: "PDUSessionEstSR",
    pduSessModSRName: 'PDUSessModSR',
    pduSesMaxNbrName: 'PDUSesMaxNbr',
    pduSesMeanNbrName: 'PDUSesMeanNbr',
    uLIpv4PacketsDrName: 'ULIpv4PacketsDr',
    uLIpv6PacketsDrName: 'ULIpv6PacketsDr',
    uLUnstrPacketsDrName: 'ULUnstrPacketsDr',
    dLIpv4PacketsDrName: 'DLIpv4PacketsDr',
    dLIpv6PacketsDrName: 'DLIpv6PacketsDr',
    dLUnstrPacketsDrName: 'DLUnstrPacketsDr',
    pfcpSessEstFRName: 'PFCPSessEstFR',
    pfcpSessModFRName: 'PFCPSessModFR',
    gsephosrKpiName: "5GSEPHOSR",
    ulUeThroughputKpiName: "UlUeThroughput",
    dluethroughputName: "DlUeThroughput",
    dldelaygnbduKpiName: "DLDelay_GnbDu",
    partialDRBAccessibilityKpiName: "PartialDRBAccessibility",
    granhosrKpiName: "GRANHOSR",
    ranPlmnidSnssaiSchemaContextId: [
                    'cellId_managedElement_tac',
                    'cellId_managedElement_nssi_tac',
                    'cellId_managedElement_nssi_plmnId_snssai_tac',
                    'managedElement',
                    'managedElement_nssi',
                    'managedElement_nssi_plmnId_snssai',
                    'nssi',
                    'nssi_tac',
                    'nssi_plmnId_snssai',
                    'nssi_plmnId_snssai_tac',
                    'plmnId_snssai',
                    'tac',
                ],
    ranAllContextId:
                  ['cellId_managedElement_nssi_plmnId_qos_snssai_tac',
                  'cellId_managedElement_nssi_plmnId_snssai_tac',
                  'cellId_managedElement_nssi_qos_tac',
                  'cellId_managedElement_nssi_tac',
                  'cellId_managedElement_tac',
                  'managedElement',
                  'managedElement_nssi',
                  'managedElement_nssi_plmnId_qos_snssai',
                  'managedElement_nssi_plmnId_snssai',
                  'managedElement_nssi_qos',
                  'nssi',
                  'nssi_plmnId_qos_snssai',
                  'nssi_plmnId_qos_snssai_tac',
                  'nssi_plmnId_snssai',
                  'nssi_plmnId_snssai_tac',
                  'nssi_qos',
                  'nssi_qos_tac',
                  'nssi_tac',
                  'plmnId_qos_snssai',
                  'plmnId_snssai',
                  'qos',
                  'tac'],
    coreAllContextID: [
        'nodeFDN',
        'snssai',
        'nodeFDN_snssai',
        'site',
        'nssi_site',
        'nssi',
        'plmnId_snssai',
        'plmnId_site_snssai',
        'nssi_plmnId_snssai',
        'nodeFDN_nssi_plmnId_snssai',
        'nodeFDN_nssi_plmnId_site_snssai'
    ],
    newCoreKPIContextID:[
        'site',
        'nssi_site',
        'nssi',
        'plmnId_snssai',
        'plmnId_site_snssai',
        'nssi_plmnId_snssai',
        'nodeFDN_nssi_plmnId_snssai',
        'nodeFDN_nssi_plmnId_site_snssai'
    ],
    networkSliceKpiContextId: [
        "snssai",
        "nodeFDN_snssai",
        "site",
        "nssi_site",
        "nssi",
        "plmnId_snssai",
        "plmnId_site_snssai",
        "nssi_plmnId_snssai",
        "nodeFDN_nssi_plmnId_snssai",
        "nodeFDN_nssi_plmnId_site_snssai"
    ],
    partialDRBAccessibilityKpiValues: [
              12.5, 12.5, 12.5, 12.5,
              25, 12.5, 12.5, 12.5, 12.5,
              12.5, 12.5, 12.5, 12.5, 12.5,
              12.5, 12.5, 12.5, 12.5, 12.5,
              12.5, 25, 25
              ],
             
    dlgnbduKpiName: "DLLat_gNB_DU",
    dlgnbduKpiValues:[
                        0.39921875, 0.39921875, 0.39921875, 0.39921875,
                        0.199609375,0.39921875, 0.39921875, 0.39921875, 0.39921875,
                        0.39921875, 0.39921875, 0.39921875, 0.39921875, 0.39921875,
                        0.39921875, 0.39921875, 0.39921875, 0.39921875, 0.39921875,
                        0.39921875,0.199609375, 0.199609375
                    ],
};

// For monitoring of SLOs related to application start and ready times.
// Each element represents SLO metric name and the agreed threshold value associated to the metrics.
export const CSAC = {
    url: `${__ENV.CSAC_URL}`, //example:'http://eric-oss-core-slice-assurance-cfg:8080'
    resetEndpoint : "/actuator/resource/reset",
    reloadEndpoint : "/actuator/resource/reload",
    resetMetrics : {
        error_metrics: [
            'csac_runtime_configuration_consistency_check_errors_total',
            'csac_configuration_reset_errors_total',
            'csac_configuration_reset_db_errors_total',
            'csac_configuration_reset_index_errors_total',
            'csac_configuration_reset_kpi_errors_total',
            'csac_configuration_reset_augmentation_errors_total',
        ],
        time_metrics: [
            'csac_configuration_reset_total_time_seconds',
            'csac_configuration_reset_index_time_seconds',
            'csac_configuration_reset_db_time_seconds',
            'csac_configuration_reset_augmentation_time_seconds',
            'csac_configuration_reset_kpi_time_seconds',
        ],
    },
    checkDeployedMetric: [
        'csac_deployed_augmentation_defs_int_total',
        'csac_deployed_profile_defs_int_total',
        'csac_deployed_kpi_instances_int_total',
        'csac_deployed_index_instances_int_total',
        'csac_runtime_kpi_instance_errors_total',
    ],
    metrics: [
        'csac_deployed_augmentation_defs_int_total',
        'csac_deployed_profile_defs_int_total',
        'csac_deployed_kpi_instances_int_total',
        'csac_deployed_index_instances_int_total',
        'csac_provisioning_pmsc_time_seconds',
        'csac_provisioning_total_time_seconds',
        'csac_runtime_kpi_instance_errors_total',
        'csac_augmentation_defs_dict_int_total',
        'csac_runtime_augmentation_errors_total',
        'csac_provisioning_index_time_seconds',
        'csac_pm_defs_dict_int_total',
        'csac_kpi_defs_dict_int_total',
    ],
    slo_metrics_values: [
        ['csac_application_ready_time_seconds', '120'],
        ['csac_application_started_time_seconds', '120']
    ],
    runtimeData: {
        augmentationErrorTotal: {
            metric: "csac_runtime_augmentation_errors_total",
            count: 0.0,
        },
        indexInstanceErrorsTotal: {
            metric: "csac_runtime_index_instance_errors_total",
            count: 0.0,
        },
    },
    runtimeIndexEndpoint: "/v1/runtime/indexes",
    runtimeStatusEndpoint: "/v1/runtime/status/current",
    deployedRuntimeIndex: "ESOA-2-Indexer",
};

// For monitoring of SLOs related to application start and ready times.
// Each element represents SLO metric name and the agreed threshold value associated to the metrics.
export const AAS = {
    url: `${__ENV.AAS_URL}`, //example:'http://eric-oss-assurance-augmentation:8080'
    catalogBaseUrl: `${__ENV.DC_URL}`, //example 'http://eric-oss-data-catalog:9590',
    dcGetEndpoint: '/catalog/v1/data-type?dataSpace=5G&dataCategory=PM_COUNTERS&schemaName=aecardq_AMF_Mobility_NetworkSlice_1',
    schemaName: 'AMF_Mobility_NetworkSlice_1',
    srSubjects: '/subjects',
    subjectName: '/AMF.Core.PM_COUNTERS.AMF_Mobility_NetworkSlice_1',
    inTopicName: "eric-oss-3gpp-pm-xml-core-parser-",
    ebsnInTopicName: "eric-oss-3gpp-pm-xml-ran-parser-ebsn",
    outTopicName: "eric-oss-assurance-augmentation-processing",
    registerEndpoint: '/v1/augmentation/registration/ardq',
    deregisterEndpoint: '/v1/augmentation/registration/ardq/aecardq',
    deregisterAecarq1Endpoint: '/v1/augmentation/registration/ardq/aecardq1',
    registrationIdsEndpoint: '/v1/augmentation/registration/ardq-ids',
    dcDeleteEndpoint: '/catalog/v2/data-provider-type',
    dcMessageBusEndpoint: '/catalog/v1/message-bus',
    dcPutEndpoint: '/catalog/v1/message-schema',
    srKeySchema: aasSchema.srKeySchema,
    srValueSchema: aasSchema.srValueSchema,
    aasRegMetric: 'aas_registrations_int_total',
    metrics: [
        'aas_augmentation_errors_int_total', //Count of augmentation processing errors
        'aas_augmentation_input_records_int_total', //Count of input records to be augmented
        'aas_augmentation_output_records_int_total', //Count of output records
        'aas_input_records_int_total', //Count of input records that do not require augmentation
        'aas_deleted_registrations_int_total', //Count of successfully deleted ARDQ registrations
        'aas_created_registrations_int_total', //Count of successfully created ARDQ registrations
        'aas_updated_registrations_int_total', //Count of successfully updated ARDQ registrations
        'aas_registrations_int_total', //Total count of ARDQ registrations
        'aas_ardq_invalid_responses_int_total', // Count of invalid ARDQ responses during augmentation processing
        'aas_ardq_valid_responses_int_total',  // Count of valid ARDQ responses during augmentation processing
        'aas_ardq_error_responses_int_total' // Count of error ARDQ responses during augmentation processing
        
        
    ],
    slo_metrics_values: [
        ['aas_application_ready_time_seconds', '120'],
        ['aas_application_started_time_seconds', '120']
    ],
    augmentedRanNssi: "macNsiDedicated20230728x1543_qosh96mac01_nssi",
    augmentedRanCellId :"1203",
    augmentedRanTac:"809",
    ran_ardq_ids: [
        'SliceOwner5QI1', //partial-DRB
        'SliceOwner5QI', //ran-oob
        'ServiceOwner5QI', //ran-oob
        'NetworkOwner', //ran-oob
        'SliceOwner', //ran-oob
        'SliceOwner1', //partial-DRB
        'ServiceOwner1', //partial-DRB
        'NetworkOwner1', //partial-DRB
        'ServiceOwner', //ran-oob
        'ServiceOwner5QI1' //partial-DRB
    ],
    core_ardq_ids: [
        'CoreSliceOwner', //oob-site-nssi May21st: Temp disabling as per all Core kpi tests has been disabled
    ]
};

export const ARDQ = {
    url: `${__ENV.CARDQ_URL}`, //example:'http://eric-oss-core-reporting-dimension-query:8080'
    augmentationEndpoint: '/v1/augmentation-info/augmentation',
    core: Object.assign({}, aasInfoRequest.aasInfoRequest.core, {
        metrics: [
            'cardq_augmentation_response_seconds_bucket',
            'cardq_augmentation_response_seconds_max',
            'cardq_augmentation_response_seconds_count',
            'cardq_augmentation_response_seconds_sum',
            'cardq_augmentation_cached_count'
        ]
    }),
    ran: aasInfoRequest.aasInfoRequest.ran,
};

export const PM_STATS = {
    calcUrl: `${__ENV.PM_CALC_URL}`, // Example: 'http://eric-oss-pm-stats-calculator:8080'
    inTopicName: 'eric-oss-3gpp-pm-xml-core-parser-',
    outTopicName: 'pm-stats-calc-handling-avro-scheduled',
};

export const PM_KPI = {
    pmDefEndpoint: '/v1/dictionary/pmdefs',
    kpiDefEndpoint: '/v1/dictionary/kpis',
    profileEndpoint: '/v1/runtime/profiles',
    prometheusEndpoint: '/actuator/prometheus',
    failedKpiInstantiationMetric: 'csac_runtime_kpi_instance_errors_total',
    failedKpiInstantiationCount: 0.0,
    start: '0',
    rows: '10',
    KPI_DATA_TYPE: `${__ENV.KPI_TYPE}`, //example:RAN or Core - default both
};

export const NAS = {
    url: `${__ENV.NAS_URL}`, //example:'http://eric-oss-network-assurance-search:3000'
    searchEngineUrl: `${__ENV.SEARCH_ENGINE_URL}`, //example:'http://eric-data-search-engine:9200'
    searchEndpoint: '/search/metrics', // {searchEndpoint} variable holds the '/search/metrics' path of Assurance Search MicroService
    discoveryEndpoint: '/assurance-testsoa/metadata',
    metricEndpoint: '/metrics',
    staticContentEndpoint: '/ui',
    keycloakUrl: "https://eric-sec-access-mgmt.hall147-sm3.ews.gic.ericsson.se/auth/realms/master/protocol/openid-connect/token", // FQDN will be resolved through env variable in deployment
    mockContextId: "NF_NSI",
    mockMetricType: "vi_NF_NSI_AMFMeanRegNbr",
    mockKpiDataValue: 12,
    mockAggregationBeginTime: 1212133444,
    mockAggregationEndTime: 1212133455,
};

export const SRtlsConfig = {
    enableTls: true,
    insecureSkipTlsVerify: false,
    minVersion: TLS_1_2,
    clientCertPem: "../../../certs/eca-k6-cert/tls.crt",
    clientKeyPem: "../../../certs/eca-k6-cert/tls.key",
    serverCaPem: "../../../certs/eric-sec-sip-tls-trusted-root-cert/ca.crt",
};

export const KFtlsConfig = {
    enableTls: true,
    insecureSkipTlsVerify: false,
    minVersion: TLS_1_2,
    clientCertPem: "../../../certs/eca-k6-kafka-cert/tls.crt",
    clientKeyPem: "../../../certs/eca-k6-kafka-cert/tls.key",
    serverCaPem: "../../../certs/eric-sec-sip-tls-trusted-root-cert/ca.crt",
};

export const NEO4J = {
    url: `${__ENV.NEO4J_URL}`, //example:'https://eric-bos-neo4j-graphdb:7473'
    neo4jUser: `${__ENV.neo4j_username}`, //example:'neo4j'
    neo4jPassword: `${__ENV.neo4j_password}`, //example:'password'
    neo4jQueryEndPoint: '/db/cardqdb/tx/commit',
    cypherAddEventQuery: 'MATCH (nrCell { name: "NR01gNodeBRadio00001-2" })--(plmn1 { name: "PlmnInfo:102-103|2-6" }), (nrCell)--(plmn2 { name: "PlmnInfo:100-101|1-5" }) RETURN nrCell, plmn1, plmn2',
    cypherUpdateEventQuery: 'MATCH (nrCell { name: "NR01gNodeBRadio00001-2" })--(plmn2 { name: "PlmnInfo:100-101|1-5" }) RETURN nrCell, plmn2',
    cypherDeleteEventQuery: 'MATCH (nrCell { name: "NR01gNodeBRadio00001-2" }) RETURN nrCell',
    metric_url: `${__ENV.NEO4J_METRICS_URL}`, //example:'https://eric-bos-neo4j-graphdb:2004'
    metrics: [
        'db.query.execution.success',
        'db.query.execution.failure',
        'transaction.rollbacks',
        'database_system_ids_in_use_relationship',
    ],
};

export const ATNKFtlsConfig = {
    enableTls: true,
    insecureSkipTlsVerify: false,
    minVersion: TLS_1_2,
    clientCertPem: "../../../certs/eric-bos-assurance-topology-notification-kafka-cert/clicert.pem",
    clientKeyPem: "../../../certs/eric-bos-assurance-topology-notification-kafka-cert/cliprivkey.pem",
    serverCaPem: "../../../certs/eric-sec-sip-tls-trusted-root-cert/ca.crt",
};
