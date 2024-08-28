import http from 'k6/http';
import { check, group, sleep } from 'k6';
import encoding from 'k6/encoding';
import { NEO4J } from '../../modules/const.js';

/* * Verify health check of ECA application services
 *
 *   @param {msURL} - The msURL of the micro-service
 *   @param {msName} - the name of micro-service
 *   @param {workInProgress} - A flag to indicate whether the micro-service is in progress
 */
export default function (msURL, msName, endpoint, workInProgress) {

  //define result for state of check and set the default value to true
  var result = true;

  group('Verify Health Status for all Microservices', function () {
    let endpoint_url = msURL + endpoint;
    console.log('Health Check for ' + msName + ' and the url is ' + endpoint_url);
    var res = '';
    
    // Retry logic
    for (var attempts = 10; attempts > 0; attempts--){
      if (msName === "Neo4j") {
        // Define the authentication header
        const headers = {
          'Authorization': 'Basic ' + encoding.b64encode(`${NEO4J.neo4jUser}:${NEO4J.neo4jPassword}`),
        };
        // Make the GET request with the authentication headers
        res = http.get(endpoint_url, { headers: headers });
      } else {
        // For other services, proceed without authentication headers
        res = http.get(endpoint_url);
      }

      if (res.status === 200) {
        break;
      }
      else{
        console.log(`Health check for ${msName} failed, retrying in 30 seconds...`);
        sleep(30);
      }
    }
    // Perform result check
    result = checkRes(workInProgress, msName, res)
    if (!result)
      console.error('Get health check for ' + msName + ' returned unexpected status ' + res.status + ".\n Response body: " + res.body);
  });
}

/* * Verify health check response
 *
 *   @param {wip} - A flag to indicate whether the micro-service is in progress
 *   @param {msName} - The name of micro-service
 *   @param {res} - Response from http get request
 *   @return {result} - Boolean response if health check is 200 or not
 */
function checkRes(wip, msName, res){
  var result = true;
  if (!wip) {
    result = check(res, {
      ['Get health check for ' + msName + ' (status: 200)']: (r) => r.status === 200
    });
  }
  else {
    result = check(res, {
      ['Get health check for ' + msName + ' (status: 200)']: (r) => r.status === 200
    }, { testState: "msworkinprogress" });
  }
  return result;
}
