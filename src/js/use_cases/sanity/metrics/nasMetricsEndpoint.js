import http from 'k6/http';
import { check, group } from 'k6';
import { NAS } from "../../../modules/const.js";

/* Verify reporting Metric Endpoint is accessible for micro-service under test
   and response body is not empty.
   @param {URL} - The url of the micro-service
*/

export default function (URL) {

  let endpoint_url = URL + NAS.metricEndpoint;
  console.log('EndPoint URL:', endpoint_url);
  const res = http.get(endpoint_url);
  const msName = 'Assurance Visualization'

  console.log(`Executing metrics verification for ${msName} and url ${endpoint_url}`);

  group(`Verify Reporting Metrics`, function () {
    // Tests if the reporting Metrics Endpoint can be reached in a given Microservice and
    // the response body is not empty.
    try {
      const metricEndpointResult = check(res, {
        'Check metric endpoint (status: 200)': (r) => r.status === 200,
        'Check metric endpoint response (not empty)': (r) => r.body.length > 0,
      });
      if (!metricEndpointResult) {
        if (res.status != 200) {
          console.error("Metric endpoint status is " + res.status);
          console.error("Metric endpoint response body is " + res.body);
        }
      }
    }

    catch (error) {
      console.error(`Unexpected exception occurred: ${error}`)
    }
  });
}
