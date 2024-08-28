import http from 'k6/http';
import { check, group } from "k6";
import { getMetricValue, getPrometheusResponse } from "../../modules/utils.js";
import { CSAC, AAS, PM_KPI } from "../../modules/const.js";

/*
 * csacAugProvisioningVerification
 * Checks for successful CSAC provisioning of AAS by checking csac metric "csac_runtime_augmentation_errors_total"
 * returns 0 and AAS metric "aas_registrations_int_total" is greater than 0
 * Also verifies the provisioned AAS configs are present in AAS
 * @param {csac_url} - URL of the CSAC service, ex: http://eric-oss-core-slice-assurance-cfg:8080
*/
export function csacAugProvisioningVerification(csac_url) {
  group("Verify CSAC provisions AAS", function () {
    try {
      let res = getPrometheusResponse(csac_url, CSAC.runtimeData.augmentationErrorTotal.metric)
      let actualCount = "";
      const result = check(
        res,
        {
        ["Check csac runtime augmentation error total metric count (count=" +
        CSAC.runtimeData.augmentationErrorTotal.count +
        ")"]: (r) => {
          actualCount = getMetricValue(
            res,
            CSAC.runtimeData.augmentationErrorTotal.metric
          );
          if (actualCount != CSAC.runtimeData.augmentationErrorTotal.count) {
            return false;
          } else {
            console.log("Provisioning of AAS by CSAC has no errors");
            return true;
          }
        },
      });
      if (!result)
        console.error(
          "Actual count for csac runtime augmentation error " +
            actualCount +
            " does not meet expected value " +
            CSAC.runtimeData.augmentationErrorTotal.count
        );
    }
    catch (error) {
      console.error(`Unexpected exception occurred verifying runtime CSAC augmentation records: ${error}`);
    }

    try {
    // Verify AAS metric has expected value greater than 0
    let aasMetricRes = getPrometheusResponse(AAS.url, AAS.aasRegMetric);
    let aasActualValue = getMetricValue(aasMetricRes, AAS.aasRegMetric);
    const aasRes = check(aasActualValue, {
      ["Check AAS registrations int total metric count (count > 0) " ]: (aasMetric) => aasMetric > 0,
    });
    if (!aasRes)
        console.error("AAS: Actual count for " + AAS.aasRegMetric + " does not meet expected value > 0");
    }
    catch (error) {
      console.error(`Unexpected exception occurred verifying metric value on AAS: ${error}`);
    }

    // Verify provisioned AAS configs
    let configResult = true
    const list_reg_id_endpoint_url = AAS.url + AAS.registrationIdsEndpoint;
    console.log(`Registration List Endpoint url is ${list_reg_id_endpoint_url}`);
    const get_list_reg_response = http.get(list_reg_id_endpoint_url);
    let id_list=[];
    if (PM_KPI.KPI_DATA_TYPE == "Core") {
      id_list = AAS.core_ardq_ids;
    }
    else if (PM_KPI.KPI_DATA_TYPE == "RAN") {
      id_list = AAS.ran_ardq_ids;
    }
    else {
      id_list = AAS.ran_ardq_ids.concat(AAS.core_ardq_ids);
    }

    try{
      console.log(get_list_reg_response.body);
      for (const id of id_list){
        configResult = check(get_list_reg_response,{
          ['Verify AAS provisioned configs']: (r) => r.body.includes(id)
        });
        if (!configResult)
          console.error(`ardq id ${id} is missing from AAS provisioning`)
      }
    }
    catch (error) {
      console.error(`Unexpected exception occurred verifying provisioned AAS configs: ${error}`)
    }
  });
}
