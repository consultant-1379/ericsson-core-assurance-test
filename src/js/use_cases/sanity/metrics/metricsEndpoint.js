import { check, group } from 'k6';
import { PROMETHEUS } from '../../../modules/const.js';
import { getPrometheusResponse } from '../../../modules/utils.js';

/* Verify Prometheus Metrics Endpoint is accessible for the microservice under test
   and response body includes list of predefined & custom metrics
   @param {msURL} - The url of the microservice
   @param {METRICS} - List of metrics to be verified in the MS endpoint response
   @param {msName} - the name of micro-service
   @param {workInProgress} - A flag to indicate whether the micro-service is in progress
*/

export function getAndVerifyMetricsEndpointResponse(msURL, METRICS, msName, workInProgress) {
    let endpoint_url;
    if (msName == "Neo4J"){
        endpoint_url = msURL;    
    }
    else{
        endpoint_url = msURL + PROMETHEUS.endpoint;
    }    

//define result for state of check and set the default value to true
var result = true;

console.log("Executing metrics verification for " + msName + "and url " + endpoint_url);
group('Verify Prometheus Metrics Endpoint', function () {

    //Tests if the Prometheus Endpoint with queried metric can be reached in a given Microservice.
    try {
        for (const metric of METRICS) {
            let res = getPrometheusResponse(msURL, metric)
            console.log('Checking ' + metric + ' in received response body ');
            //Tests if the Prometheus response has listed metric name.
            if (!workInProgress)
                result = check(res, {
                    ['Get metrics endpoint for ' + msName + ' (status: 200)']: (r) => r.status === 200,
                    ['Check ' + msName + ' metrics (exists) ']: (r) => r.body.includes(metric)
                });
            else if (msName == "ATN")
                result = check(res, {
                    ['Get metrics endpoint for ' + msName + ' (status: 200)']: (r) => r.status === 200,
                    ['Check ' + msName + ' metrics (exists) ']: (r) => r.body.includes(metric),
                    ['Check ' + msName + ' metric  Input_topic as networktopic ']: (r) => r.body.includes.input_topic =="networktopic"
                    
                });
            else
                result = check(res, {
                    ['Get metrics endpoint for ' + msName + ' (status: 200)']: (r) => r.status === 200,
                    ['Check ' + msName + ' metrics(exists) ']: (r) => r.body.includes(metric)
                }, { testState: "msworkinprogress" });

            if (!result)
                console.error(metric +" verification of " + msName +" returned response code "+ res.status +".\n Response body: " + res.body);
        }
    }
    catch (error) {
        console.error(`Unexpected exception occurred: ${error} processing metrics endpoint for ${msName}`)
    }
});
}
