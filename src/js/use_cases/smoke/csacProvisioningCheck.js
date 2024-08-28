import { group, check } from "k6";
import http from 'k6/http';
import { getMetricValue, getPrometheusResponse, retryWrapper } from "../../modules/utils.js";
import { CSAC, AAS } from "../../modules/const.js";

/**
 * csacProvisioning()
 * This function verifies if the CSAC provisioning is successful to AAS, PMSC and AIS.
 * @returns {consistency_check} - returns a boolean value of CSAC provisioning status.
 */
export function csacProvisioning() {

    let endpoint_url = CSAC.url + CSAC.runtimeStatusEndpoint;
    const res = http.get(endpoint_url);
    console.log(" runtimeStatusEndpoint status is :", res.status);
    let jsonArray = JSON.parse(res.body);
    let provisioningState = jsonArray["provisioningState"];
    console.log(" runtimeStatusEndpoint jsonArray  provisioningState is :", provisioningState);
    if (provisioningState == "COMPLETED"){
        return true;
    }
    else if (provisioningState == "ERROR"){
        return "error";
    }
    else{
        return false;
    }
}

export function csacProvisioningCheck() {
    group("Verify the CSAC provisioning to AAS, PMSC and AIS", function () {
        let consistencyStatus = retryWrapper(15, 20, csacProvisioning)
        let checkConsistency = check(consistencyStatus, {
            ['Check the CSAC provisioning is successful']: (r) => r === true
        });
        if (!checkConsistency)
            console.error('csac provisioning is not successful');
    })
}
