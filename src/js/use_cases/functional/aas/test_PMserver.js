import { PMSERVER_URL, AAS, ATN, AIS, CSAC, ARDQ } from '../../../modules/const.js';
import http from 'k6/http';
import { check, group } from 'k6';

/* * Verify connection to PM Server and uS metrics can be read
*/
export default function () {
  group('Test PM Server Connection', function () {
    // Check prometheus in-built metric for connection verification
    let endpoint_url = PMSERVER_URL+"/api/v1/query?query=prometheus_ready";
    const res = http.get(endpoint_url);
    check(res, {
      ['Verify PM Server connection (status: 200)']: (r) => r.status === 200
    });

    // Create combined list of all uS metrics
    var metrics = AAS.metrics.concat(ATN.metrics, AIS.metrics, ARDQ.core.metrics, CSAC.metrics, CSAC.checkDeployedMetric)

    // Loop through all metrics and check they can be read from PM Server
    for (const metric of metrics){
      // console.log("Checking metric " + metric + " on PM Server");
      endpoint_url = PMSERVER_URL+"/api/v1/query?query="+metric
      var met = http.get(endpoint_url)
      check(met, {
        ['Verify PM Server uS metrics (status: 200)']: (r) => r.status === 200
      });
    }
  });
}
