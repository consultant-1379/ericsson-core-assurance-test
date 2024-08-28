import http from "k6/http";
import { check, group } from "k6";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { NAS } from "../../modules/const.js";


const csacUuidRegex = /^csac_[0-9a-f]{8}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{12}$/;

/** verifyKPISearchSuccess()
*   Get the list of KPIs matching search criteria
*   @param {indexEndpoint} - The index endpoint of the Assurance Search microservice
*   @param {contextTypeId} - The name of the context id
*   @param {metricTypeId} - MetricId use for querying through Nas Microservice
*   @param {kpiValue} - Expected kpi value as per kpi definition
*   @param {kpiBeginTimestamp} - Begin timestamp for kpi calculation
*   @param {kpiEndTimestamp} - End timestamp for kpi calculation
*/
export function verifyKPISearchSuccess(indexEndpoint, contextTypeId, metricTypeId, kpiValue, kpiBeginTimestamp, kpiEndTimestamp)  {

  group('Get KPIs by Metric Name on NAS', function () {
    //  The contextTypeId & metricTypes used in the params below is from the contextTypeId and metricTypeId arguments
    const url_params = new URL(NAS.url + '/' + indexEndpoint + NAS.searchEndpoint);
    url_params.searchParams.append('contextTypeId', contextTypeId);
    url_params.searchParams.append('metricTypes[0][id]', metricTypeId);
    const kpiSearchRes = http.get(url_params.toString());

    try {
      const kpiSearchResult = check(kpiSearchRes, {
        "Get KPI search (status: 200)": (r) => r.status === 200,
        "Check KPI search response body (not empty)": (r) => r.body.length > 0
      });

      if (!kpiSearchResult) {
        if (kpiSearchRes.status != 200) {
          console.error("KPI search returned unexpected status " + kpiSearchRes.status);
          console.error("KPI search response body " + kpiSearchRes.body);
        }
      }

      const resultBodyContent = check(kpiSearchRes, {
        'Check KPI search response and calculated kpi value (metric name)': (r) => {
          const jsonArray = JSON.parse(kpiSearchRes.body).results;
          let result = false;

          // Verify the metadata of the metrics object
          for (let i = 0; i < jsonArray.length; i++) {
            result = (jsonArray[i].metrics).some(metric => {
              const tableItem = (metric.metadata).find(item => item.key === "csac_table");
              const columnItem = (metric.metadata).find(item => item.key === "csac_column");
              return (
                metric.type.id === metricTypeId &&
                metric.value === kpiValue &&
                metric.beginTimestamp === kpiBeginTimestamp &&
                metric.endTimestamp === kpiEndTimestamp &&
                (
                  (tableItem && (tableItem.value.startsWith("kpi_") || tableItem.value.startsWith("soa"))) &&
                  (columnItem && columnItem.value.match(csacUuidRegex))
                )
              );
            });

            if (result) {
              console.info(`KPI validation passed for ${metricTypeId}`)
              return result;
            }
          }
          return result;
        }
      });

      if (!resultBodyContent) {
        console.error(`KPI validation failed for ${metricTypeId} due to value mismatch \n` +
        `Actual values doesn't match with expected values in response body: ${kpiSearchRes.body} \n` +
        `Expected values: KPI value-${kpiValue}, begin time-${kpiBeginTimestamp}, end time-${kpiEndTimestamp}`);
      }
   }
   catch (error) {
    console.error(`Unexpected exception occurred in verifyKPISearchSuccess: ${error}`);
   }
 });
}
