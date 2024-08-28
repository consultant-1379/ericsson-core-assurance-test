import { sleep } from 'k6';
import { htmlReport } from "/modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { HEALTH, ARDQ, AIS, AAS, CSAC, ATN, PM_STATS, NAS, KAFKA_SERVER_URL,
         ADP_KAFKA_URL, SR_URL, OS_URL, NEO4J, PM_KPI } from "./modules/const.js";
import { atnCtsEventCreateTopicAndVerify, closeAtnKafkaConnections } from './modules/atn/atnKafkaFunction.js';
import { verifySchemasInSRandDC } from "./modules/aas/verifySRandDC.js";
import { setupCoreRanKafkaTopicsForAASandPMSCH } from './modules/pmsch/pmschSetupAndIngestPmData.js';
import { pmschAasPmDataIngest } from './modules/pmsch/pmschAasPmDataIngest.js';
import getHealthStatus from "./use_cases/smoke/healthStatus.js";
import { getAndVerifyMetricsEndpointResponse } from "./use_cases/sanity/metrics/metricsEndpoint.js";
import csacPmKpiVerification from "./use_cases/smoke/csacPmKpiVerification.js";
import { csacAugProvisioningVerification } from "./use_cases/smoke/csacProvisioningAASVerification.js";
import cardqAugGetInfo from "./use_cases/functional/cardq/cardqAugGetInfo.js";
import cardqAugNssiSiteGetInfo from "./use_cases/functional/cardq/cardqAugNssiSiteGetInfo.js";
import cardqAugRanGetInfo from "./use_cases/functional/cardq/cardqAugRanGetInfo.js";
import { verifyApplicationSLOs } from "./use_cases/sanity/metrics/SLOsVerification.js";
import { csacIndexerProvisioningVerification } from "./use_cases/smoke/csacProvisioningIndexerVerification.js"
import { aasFunctionalFlows } from "./use_cases/functional/aas/aasFunctionalFlows.js";
import checkAssuranceSearchEndpoint from "./use_cases/functional/nas/assuranceSearchEndpoint.js";
import searchEngineDataIngestSearchMSVerify from "./use_cases/integration/assuranceSearchDataIngestVerify.js";
import checkMetricsEndpointResponse from "./use_cases/sanity/metrics/nasMetricsEndpoint.js";
import indexBuilding from "./use_cases/functional/indexBuilding.js";
import { atnChangeEventsVerification } from "./use_cases/functional/atn/atnChangeEventsVerification.js";
import { verifyAtnNeo4jAddEventData } from './use_cases/integration/atnNeo4jAddEventCheck.js';
import { verifyAtnNeo4jUpdateEventData } from './use_cases/integration/atnNeo4jUpdateEventCheck.js';
import { verifyAtnNeo4jDeleteEventData } from './use_cases/integration/atnNeo4jDeleteEventCheck.js';
import { csacProvisioningCheck } from "./use_cases/smoke/csacProvisioningCheck.js";
import { csacVerifyReset } from "./use_cases/integration/csacReset.js";
import { csacVerifyReload } from "./use_cases/integration/csacReload.js";
import indexerNasIntegrationCheck from "./use_cases/integration/indexerNasIntegrationCheck.js";
import { indexerNasSetup, indexerNasTeardown } from "./use_cases/integration/indexerNasIntegrationCheck.js";
import { addRanTopologyData, deleteRanTopologyData } from "./use_cases/functional/atn/addRanTopologyData.js";
import { addCoreTopologyData, deleteCoreTopologyData } from "./use_cases/functional/atn/addCoreTopologyData.js";
import { verifyAllCoreKpi } from './use_cases/e2e/verifyAllCoreKpi.js';
import { verifyAllRanKpi } from './use_cases/e2e/verifyAllRanKpi.js';

export const options = {
  setupTimeout: "20m",
  teardownTimeout: "10m",
  tlsAuth: [
    {
      cert: open("../certs/eca-k6-cert/tls.crt"),
      key: open("../certs/eca-k6-cert/tls.key"),
    },
    {
      cert: open("../certs/eric-pm-serv-cert/tls.crt"),
      key: open("../certs/eric-pm-serv-cert/tls.key"),
    }
  ],
  scenarios: {
    scenario1: {
      exec: "oneVUusecases",
      executor: 'per-vu-iterations',
      startTime: '0s',
      vus: 1,
      iterations: 1,
      maxDuration: '4800s',
    },
    scenario2: {
      exec: "multiVUusecases",
      executor: 'per-vu-iterations',
      startTime: '4s',
      vus: 50,
      iterations: 1
    },
    scenario3:{
      exec: "ATNusecases",
      executor: "per-vu-iterations",
      startTime: '10s',
      vus: 1,
      iterations: 1,
      maxDuration: '600s'
    }
  }
};
export function setup() {
  sleep(900);
  indexerNasSetup(SR_URL, KAFKA_SERVER_URL, AIS.url);
  atnCtsEventCreateTopicAndVerify(ADP_KAFKA_URL, ATN.ctsEventTopic, ATN.topologyEventTopic);
  if (PM_KPI.KPI_DATA_TYPE == "Core") {
    // Adding Core Topology Data
    addCoreTopologyData(ADP_KAFKA_URL);
  }
  else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
    // Adding RAN Topology Data
    addRanTopologyData(ADP_KAFKA_URL);
  }
  else {
    // Adding Core and Ran Topology Data
    addRanTopologyData(ADP_KAFKA_URL);
    addCoreTopologyData(ADP_KAFKA_URL);
  }
  verifySchemasInSRandDC();
  setupCoreRanKafkaTopicsForAASandPMSCH();
}
export function oneVUusecases () {
  // sanity test cases
  getHealthStatus(CSAC.url, "CSAC", HEALTH.endpoint, false);
  getHealthStatus(ARDQ.url, "CARDQ", HEALTH.endpoint, false);
  getHealthStatus(AAS.url, "AAS", HEALTH.endpoint, false);
  getHealthStatus(NAS.url, "NAS", HEALTH.nasHealthEndpoint, false);
  getHealthStatus(AIS.url, "AIS", HEALTH.endpoint, false);
  getHealthStatus(ATN.url, "ATN", HEALTH.atnHealthReadinessEndpoint, false);
  getHealthStatus(ATN.url, "ATN", HEALTH.atnHealthLivenessEndpoint, false);
  // WIP for now until we get a better idea of the start up time requirements
  getHealthStatus(PM_STATS.calcUrl, "PM_Calc", HEALTH.pmCalcEndpoint, true);
  getHealthStatus(NEO4J.url, "Neo4j", HEALTH.neo4jHealthEndpoint, false);
  csacProvisioningCheck();
  pmschAasPmDataIngest();
  getAndVerifyMetricsEndpointResponse(CSAC.url, CSAC.metrics, "CSAC", false);
  getAndVerifyMetricsEndpointResponse(ARDQ.url, ARDQ.core.metrics, "ARDQ", false);
  getAndVerifyMetricsEndpointResponse(ATN.url, ATN.metrics, "ATN", false);
  getAndVerifyMetricsEndpointResponse(AAS.url, AAS.metrics, "AAS", false);
  getAndVerifyMetricsEndpointResponse(AIS.url, AIS.metrics, "AIS", false);
  getAndVerifyMetricsEndpointResponse(NEO4J.metric_url, NEO4J.metrics, "Neo4J", false);
  if (PM_KPI.KPI_DATA_TYPE == "Core") {
    cardqAugGetInfo(ARDQ.url);
    cardqAugNssiSiteGetInfo(ARDQ.url);
  }
  else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
    cardqAugRanGetInfo(ARDQ.url);
  }
  else {
    cardqAugGetInfo(ARDQ.url);
    cardqAugNssiSiteGetInfo(ARDQ.url);
    cardqAugRanGetInfo(ARDQ.url);
  }
  csacPmKpiVerification(CSAC.url);
  csacAugProvisioningVerification(CSAC.url);
  csacIndexerProvisioningVerification(CSAC.url);
  verifyApplicationSLOs(CSAC.url, CSAC.slo_metrics_values, "CSAC");
  verifyApplicationSLOs (AAS.url, AAS.slo_metrics_values, "AAS");
  verifyApplicationSLOs (ATN.url, ATN.slo_metrics_values, "ATN");
  aasFunctionalFlows();
  checkAssuranceSearchEndpoint(NAS.url, NAS.staticContentEndpoint, "Static Content Endpoint", false);
  checkMetricsEndpointResponse(NAS.url);
  indexerNasIntegrationCheck(NAS.url);
  indexBuilding(AIS.url, SR_URL, OS_URL, KAFKA_SERVER_URL);
  // PMSCH End to End Test Cases
  if (PM_KPI.KPI_DATA_TYPE == "Core") {
    //Core kpis
    verifyAllCoreKpi();
  }
  else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
    //RAN kpis
    verifyAllRanKpi();
  }
  else {
    // Core and Ran Kpis
    verifyAllCoreKpi();
    verifyAllRanKpi();
  }
}
export function multiVUusecases () {
  // This is a mock data ingest to search engine and verify the search endpoint on Assurance Search MS
  searchEngineDataIngestSearchMSVerify('/assurance-testsoa');
}
export function ATNusecases(){
/*  atnChangeEventsVerification(ADP_KAFKA_URL);
  verifyAtnNeo4jAddEventData(ADP_KAFKA_URL);
  verifyAtnNeo4jUpdateEventData(ADP_KAFKA_URL);
  verifyAtnNeo4jDeleteEventData(ADP_KAFKA_URL); */
}
//create html report for the tests.
export function handleSummary(data) {
  console.log("Preparing the end-of-test summary...");
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "/reports/result.html": htmlReport(data),
    "/reports/summary.json": JSON.stringify(data),
  };
}
export function teardown() {
  indexerNasTeardown(AIS.url, "assurance-soa-indexer-for-ui-testing");
  if (PM_KPI.KPI_DATA_TYPE == "Core") {
    // Deleting Core Topology Data
    deleteCoreTopologyData(ADP_KAFKA_URL);
  }
  else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
    // Deleting RAN Topology Data
    deleteRanTopologyData(ADP_KAFKA_URL);
  }
  else {
    // Deleting Core and Ran Topology Data
    deleteCoreTopologyData(ADP_KAFKA_URL);
    deleteRanTopologyData(ADP_KAFKA_URL);
  }
  closeAtnKafkaConnections();
//  csacVerifyReset();
//  csacVerifyReload();
}
