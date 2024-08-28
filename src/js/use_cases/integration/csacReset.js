import http from "k6/http";
import { group, check } from "k6";
import { getMetricValue, getPrometheusResponse } from "../../modules/utils.js";
import { CSAC, AAS } from "../../modules/const.js";


/** csacVerifyReset
 *  Verifies if CSAC reset was successful
 */
export function csacVerifyReset() {
    group("Verify CSAC Reset Operation", function () {
        // Send delete request to CSAC to perform reset
        let url = CSAC.url + CSAC.resetEndpoint;
        console.info("CSAC: Calling Reset....")
        const res = http.del(url, {
            headers: { 'Content-Type': 'application/json' }
        }, { timeout: '120s' });
        const resetRes = check(res, {
            ["Check CSAC reset request (status = 204)"]: (r) => r.status === 204,
        });
        if (!resetRes)
            console.error("CSAC: Unexpected status code " + res.status + " response for reset with " + res.body);

        // Verify all csac metrics are having the expected values after reset is done
        for (const key of Object.keys(CSAC.resetMetrics)) {
            if (key == 'error_metrics') {
                for (let i = 0; i < CSAC.resetMetrics[key].length; i++) {
                    let errMetricRes = getPrometheusResponse(CSAC.url, CSAC.resetMetrics[key][i]);
                    let actualErrorValue = getMetricValue(errMetricRes, CSAC.resetMetrics[key][i]);
                    const errResult = check(actualErrorValue, {
                        ["Check CSAC reset error metrics (count = 0)"]: (errMetric) => errMetric === 0,
                    });
                    if (!errResult)
                        console.error("CSAC: Actual count for " + CSAC.resetMetrics[key][i] + " does not meet expected value 0.0 for reset");
                }
            }
            else {
                for (let i = 0; i < CSAC.resetMetrics[key].length; i++) {
                    let timeMetricRes = getPrometheusResponse(CSAC.url, CSAC.resetMetrics[key][i]);
                    let actualTimeValue = getMetricValue(timeMetricRes, CSAC.resetMetrics[key][i], true);
                    const timeResult = check(actualTimeValue, {
                        ["Check CSAC reset time metrics (time > 0)"]: (timeMetric) => parseFloat(timeMetric) > 0
                    });
                    if (!timeResult)
                        console.error("CSAC: Actual time for " + CSAC.resetMetrics[key][i] + " does not meet expected value > 0 for reset");
                }
            }
        }
        // Verify AAS metric have the expected 0 value
        let aasMetricRes = getPrometheusResponse(AAS.url, AAS.aasRegMetric);
        let aasActualValue = getMetricValue(aasMetricRes, AAS.aasRegMetric);
        const aasRes = check(aasActualValue, {
            ["Check AAS metric " + AAS.aasRegMetric + " after reset (count = 0)"]: (aasMetric) => aasMetric === 0
        });
        if (!aasRes)
            console.error("AAS: Actual count for " + AAS.aasRegMetric + " does not meet expected value for reset");
    });
}
