import http from "k6/http";
import { check, group, sleep } from "k6";
import { AIS } from '../../modules/const.js';


/**  verifyIndexExists()
 *   Get a registered index and verify index exists
 *   @param {url} - The url of the micro-service and the endpoint with indexName as search parameter
 *   @param {IndexName} - The IndexName of the Index under test
 */
export function verifyIndexExists(url, IndexName) {
    let indexer_url = AIS.url + AIS.endpoint;
    console.log("AIS indexer url is "+ indexer_url);
    let getIndex_params = new URL(indexer_url);
    getIndex_params.searchParams.append('name', IndexName);

    const indexSearchRes = http.get(getIndex_params.toString());
  
    //define indexSearchResult for state of check and set the default value to true
    var indexSearchResult = true;
  
    // Verifying the presence of newly added Index
    indexSearchResult = check(indexSearchRes, {
      "Check registered index search (status: 200)": (r) => r.status === 200,
    });
    if (!indexSearchResult)
      console.error('Index search expected status 200 but received status ' + indexSearchRes.status + ".\n Response body: " + indexSearchRes.body);
  }
  
/**  verifyIndexExistsInList()
 *   Get list of registered indexes and verify the index exists in list
 *   @param {url} - The url of the micro-service and the endpoint for retrieving all index list
 *   @param {indexName} - name of the index to verify
 *   @param {indexExists} - Optional flag to toggle index verification in list after registration
 *                          or deregistration of an index
 *   @param {retryAttempt} - To paas the current retry attempt
 *   @param {retryLimit} - To pass the retry limit
 *   @returns {indexCheck} - Boolean value to be returned with respect to verification
 */
export function verifyIndexExistsInList(url, indexName, indexExists= true, retryAttempt=1, retryLimit=1) {
  let getIndexList_url = AIS.url + AIS.listEndpoint;
  // variable "listIndexRes" declared for getting the indexlist response body
  // variable "indexCheck" is a flag value set to check the existence of index
  let listIndexRes;
  let indexCheck = false;

  try {
    listIndexRes = http.get(getIndexList_url, {
      headers: { "Content-Type": "application/json" },
    });
    if (listIndexRes.status === 200) {
      let jsonArray = JSON.parse(listIndexRes.body);
      let hasKeyValue = jsonArray.some(json => json.name === indexName);
      if (hasKeyValue === indexExists) {
        indexCheck = true;
        console.log(`The index existence with respect to ${indexCheck} is successful`);
      }
    }  
  }
  catch (error) {
    console.error(`Unexpected exception occured: ${error} processing the response body of list Index API`);
  }
  finally {
    if (indexCheck === true || retryAttempt === retryLimit) {

      // verify if the get response is successful for index body
      let listIndexResult = check(listIndexRes, {
        'List index (status: 200)': (r) => r.status === 200,
      });
      if (!listIndexResult)
        console.error('AIS list index returned unexpected status ' + listIndexRes.status + ".\n Response body: " + listIndexRes.body);

      // verify if the index is present when indexExists=true is passed
      let listIndexCheck;
      if (indexExists) {
        listIndexCheck = check(indexCheck, {
          "Verify in list index response (index)": (r) => r === true
        });
        if (!listIndexCheck)
          console.error('Index missing in list index response (' + indexName + '): ' + listIndexRes.body);
      }
      // verify if the index is not present when indexExists=false is passed
      else {
        listIndexCheck = check(indexCheck, {
          "Verify not present in list index response (index)": (r) => r === true
        });
        if (!listIndexCheck)
          console.error('Unexpected index in list index response (' + indexName + '): ' + listIndexRes.body);
      }
    }
  }
  return indexCheck;
}

/** registerIndex()
 *  Register An Index
 *  @param {url} - the url of the micro-service
 *  @param {IndexSpec} - The Index Specification used to register an Index
 */
export function registerIndex(url, IndexSpec) {
  let indexer_url = AIS.url + AIS.endpoint;
  console.log("AIS indexer url is "+ indexer_url);
    
  group("Register An Index", function() {
      const registrationRes = http.put(indexer_url, JSON.stringify(IndexSpec), {
          headers: { "Content-Type": "application/json" },
      });
      const registrationResult = check(registrationRes, {
        "Check registation (status: 200)": (r) => r.status === 200,
      });
      if (!registrationResult)
      console.error('AIS index registration returned unexpected status ' + registrationRes.status + ".\n Response body: " + registrationRes.body);

      sleep (1);
  });
}

/** deregisterIndex()
 *  Deregister an Index
 *  @param {url} - the url of the micro-service
 *  @param {IndexName} - The IndexName of the Index under test
 */
export function deregisterIndex(url, IndexName) {
  let indexer_url = AIS.url + AIS.endpoint;
  console.log("AIS indexer url is "+ indexer_url);
  let deleteIndex_params = new URL(indexer_url);
  deleteIndex_params.searchParams.append('name', IndexName);

  group("Deregister An Index", function () {
    const deregistrationRes = http.del(deleteIndex_params.toString());

    const deregistrationResult = check(deregistrationRes, {
      'Check deregistration (status: 200)': (r) => r.status === 200
    });
    if (!deregistrationResult)
      console.error('AIS index deregistration returned unexpected status ' + deregistrationRes.status + ".\n Response body: " + deregistrationRes.body);

    sleep (2);
  });
}
