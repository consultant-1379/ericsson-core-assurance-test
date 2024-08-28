import http from "k6/http";
import { check, group } from "k6";
import { getMetricValue } from "../../modules/utils.js";
import { PROMETHEUS, CSAC } from "../../modules/const.js";
import { getPrometheusResponse } from "../../modules/utils.js";

/*
This function is checking if the provision of INDEXER by CSAC at startup is successful.
This is validated by verifying if the metric "csac_runtime_index_instance_errors_total" returns '0'.
*/

export function csacIndexerProvisioningVerification(csac_url) {
  group("Verify CSAC provisions Indexer", function () {
    try {
    let res = getPrometheusResponse(csac_url, CSAC.runtimeData.indexInstanceErrorsTotal.metric)
    let actualCount = "";
    const result = check(
      res,
      {
        ["Check csac runtime index instances errors total metric count (count=" +
        CSAC.runtimeData.indexInstanceErrorsTotal.count + ")"]: (r) => {
          actualCount = getMetricValue(
            res,
            CSAC.runtimeData.indexInstanceErrorsTotal.metric
          );
          if (actualCount != CSAC.runtimeData.indexInstanceErrorsTotal.count) {
            return false;
          }
          else {
            console.log("Provisioning of Indexer by CSAC has no errors");
            return true;
          }
        },
      });
    if (!result)
      console.error(
        "Actual count for csac runtime index instances errors " +
          actualCount +
          " does not meet expected value " +
          CSAC.runtimeData.indexInstanceErrorsTotal.count
      );
    }
    catch (error) {
        console.error(`Unexpected exception occurred: ${error} for CSAC provisions Indexer`)
    }

    //Validating the runtime index information available in CSAC
    try {
      let res = http.get(csac_url + CSAC.runtimeIndexEndpoint);
        let deployedIndex = false;
        const result = check(res, {
          ['Get CSAC Runtime Index endpoint (status: 200)']: (r) => r.status === 200,
          ['Check endpoint response body content (index = ESOA-2-Indexer)']: (r) => {
            let indexArray = JSON.parse(r.body).indexes;
            for (const index of indexArray) {
              if(index.name == CSAC.deployedRuntimeIndex) {
                deployedIndex = true;
                return deployedIndex; }
            }
            return deployedIndex;
          }
        });
        if (!result) {
          if (res.status != 200) {
            console.error("Get " + csac_url + CSAC.runtimeIndexEndpoint + " endpoint returned unexpected status " + res.status + ". Response body: " + res.body);
          }
          if (!deployedIndex) {
            console.error("Runtime index not found in returned response of " + csac_url + CSAC.runtimeIndexEndpoint + " endpoint. Response body: " + res.body);
          }
        }
      }
      catch (error) {
        console.error(`Unexpected exception occurred: ${error} processing response for CSAC Runtime Index verification`)
      }
  });
}
