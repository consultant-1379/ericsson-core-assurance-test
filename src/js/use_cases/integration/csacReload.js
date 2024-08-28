import http from "k6/http";
import { group, check } from "k6";
import { getMetricValue, getPrometheusResponse } from "../../modules/utils.js";
import { CSAC, AAS } from "../../modules/const.js";


/**
 * csacVerifyReload
 * Verifies if CSAC Reload operation was successful
 */
export function csacVerifyReload() {
    group("Verify CSAC Reload Operation", function () {
        // Send post request to CSAC to perform reload
        let url = CSAC.url + CSAC.reloadEndpoint;
        console.info("CSAC: Calling reload.....")
        const res = http.post(url, {
            headers: { 'Content-Type': 'application/json' }
        }, { timeout: '300s' });
        const reloadRes = check(res, {
            ["Check CSAC reload request (status = 200)"]: (r) => r.status === 200,
        });
        if (!reloadRes)
            console.error("CSAC: Unexpected status code " + res.status + " response for reload with " + res.body);

        // Verify all csac metrics are having the expected values after reload is done with > 0
        for (let i = 0; i < 4; i++) {
            let csacMetricRes = getPrometheusResponse(CSAC.url, CSAC.metrics[i]);
            let actualValue = getMetricValue(csacMetricRes, CSAC.metrics[i]);
            const csacResult = check(actualValue, {
                ["Check CSAC metrics after reload (count > 0)"]: (csacMetric) => csacMetric > 0,
            });
            if (!csacResult)
                console.error("CSAC: Actual count for " + CSAC.metrics[i] + " does not meet expected value > 0 for reload");
        }

        // Verify AAS metric have the expected greater than 0 value after reload
        let aasMetricRes = getPrometheusResponse(AAS.url, AAS.aasRegMetric);
        let aasActualValue = getMetricValue(aasMetricRes, AAS.aasRegMetric);
        const aasRes = check(aasActualValue, {
            ["Check AAS metric " + AAS.aasRegMetric + " after reload (count > 0)"]: (aasMetric) => aasMetric > 0,
        });
        if (!aasRes)
            console.error("AAS: Actual count for " + AAS.aasRegMetric + " does not meet expected value > 0 for reload");
    });
}
