import http from 'k6/http';
import { check, group, sleep } from 'k6';

/* * Verify status of Assurance Visualization application services
 *
 *   @param {url} - Network assurance micro-service url
 *   @param {endpoint} - the endpoint in Assurance Visualization Network Search that we are testing
 *   @param {endpointDescription} - the description of the endpoint in Assurance Visualization Network Search that we are testing
 *   @param {workInProgress} - A flag to indicate whether the micro-service is in progress
 */
export default function (url, endpoint, endpointDescription, workInProgress) {
  group('Verify network search ' + endpointDescription, function () {
    let endpoint_url = url + endpoint;
    console.log('Verify Assurance Visualization Network Search ' + endpointDescription + ' ' + endpoint_url);

    const res = http.get(endpoint_url);

    var checkEndpointStatus = 'Get ' + endpointDescription + ' (status: 200)';

    //define result for state of check and set the default value to true
    var result = true;

    if (!workInProgress)
      result = check(res, {
        [checkEndpointStatus]: (r) => r.status === 200
      });
    else
      result = check(res, {
        [checkEndpointStatus]: (r) => r.status === 200
      }, { testState: "msworkinprogress" });

    if (!result)
      console.error('Get ' + endpointDescription + ' status is ' + res.status);

    sleep(1);
  });
}
