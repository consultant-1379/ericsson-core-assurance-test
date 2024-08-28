import { NAS } from "../../modules/const.js";
import { verifyKPISearchSuccess } from '../../modules/nas/nasDataVerificationFunctions.js';

/* * Verify Index created by setup() exists and verify if Assurance search MS can retrieve KPI data
*
*   This function expects the index exists and kafka records are ingested, which is take care by the function
*   'indexerNasSetup(SR_URL, KAFKA_URL, AIS_URL)' which is called in the setup() function in the main.js.
*   If the index exist verifyKPISearchSuccess() function get the kpi value based on the context id and the
*   metric type passed. Then it verifies the kpi metric value based on the start and end timestamp passed
*
*   @param {assurance_search_url} - The url of the search Microservice
*   @param {indexEndpoint} - The endpoint to add index or document in search engine
*/
export default function (indexEndpoint) {
/*  Passing mock values for contextId, metricType, kpiValue, aggregationStart and aggregationEnd timestamp to verify kpi data function
  This are fixed values which are set during setup for multi UE verification test case
  verifyKPISearchSuccess function is used to get and verify the kpi value from the nas query for search metrics based on the start and end timestamp passed */
  verifyKPISearchSuccess(indexEndpoint, NAS.mockContextId, NAS.mockMetricType, NAS.mockKpiDataValue, NAS.mockAggregationBeginTime, NAS.mockAggregationEndTime);
}
