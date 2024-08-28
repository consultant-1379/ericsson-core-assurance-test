import { check, group } from 'k6';
import { getMetricValue } from '../../../modules/utils.js'
import { PROMETHEUS } from '../../../modules/const.js';
import { getPrometheusResponse } from '../../../modules/utils.js';

/* Verify reporting SLOs Metric Endpoint is accessible for micro-service under test
   and response body includes list of predefined SLO metrics with agreed threshold value
   @param {msURL} - The url of the micro-service
   @param {SLO_METRICS} - List of SLO metrics name and agreed threshold value
   @param {msName} - the name of micro-service
*/
export function verifyApplicationSLOs(msURL, SLO_METRICS, msName) {
  let endpoint_url = msURL + PROMETHEUS.endpoint;
  console.log(`Executing ECA Application SLOs for ${msName} and url ${endpoint_url}`);

  group('Verify Prometheus SLOs Metrics Endpoint', function () {
    // Tests if the reporting Metric Endpoint for queried metric can be reached for a given Microservice and returns with 200 OK
    try {
      for (const metric_line of SLO_METRICS) {
        console.log('Checking ' + metric_line[0] + ' in response body');
        let res = getPrometheusResponse(msURL, metric_line[0])
        //get metric values from metric response for a given metric name
        const metricValue = getMetricValue(res, metric_line[0]);
        // Test the response body includes the SLO metric
        const sloMetricValueResult = check(res, {
          ['Get SLOs metrics endpoint for ' + msName + ' (status: 200)']: (r) => r.status === 200,
          // Test the SLO value of the metric falls under agreed threshold value
          ['Check SLOs metrics endpoint response body content for ' + msName + ' (SLO Value)']: (r) => ((metricValue > 0) && (metricValue <= parseInt(metric_line[1])))
        });
        if (!sloMetricValueResult) {
          if (res != 200)
            console.error("SLOs metrics endpoint response for " + msName + " returned unexpected status " + res.status + ".\n Response body: " + res.body);

          if ((metricValue <= 0) || (metricValue > parseInt(metric_line[1])))
            console.error('Actual metric value ' + metricValue + ' does not meet SLO threshold for ' + msName + ".\n Response body: " + res.body);
        }
        else {
          console.log(`Value for SLO metric ${metric_line[0]} is ${metricValue}`);
        }
      }
    }
    catch (error) {
      console.error(`SLO verification for ${msName} failed with error: ${error}`)
    }
  });

}
