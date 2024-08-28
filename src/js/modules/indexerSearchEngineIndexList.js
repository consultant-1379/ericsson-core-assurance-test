import http from "k6/http";
import { check, group, sleep } from "k6";
import { AIS } from './const.js';
import { verifyIndexExists, verifyIndexExistsInList, registerIndex, deregisterIndex } from '../modules/ais/indexOperations.js'

/*
 * Query Search Engine Index List and verify response contains
 * name, displayName and indexDescription attributes.
 * @param {url} - The url of the micro-service
 */

export function searchEngineIndexList (url, IndexName) {
    group("Verify Search Engine Index List Endpoint Response", function () {
      let searchEngine_url = url + AIS.searchEngineEndpoint;
      let searchEngineIndexListResp;
      console.log("Search Engine Index List endpoint is "+searchEngine_url);

      verifyIndexExists(url, IndexName);

      //get search engine index list
      searchEngineIndexListResp = http.get(searchEngine_url);

      const respResult = check(searchEngineIndexListResp, {
          "Get Search Engine Index List (status: 200)": (r) => r.status === 200,
      });

      if(!respResult)
        console.error("Search Engine Index List returned unexpected status "+ searchEngineIndexListResp.status + ".\n Response body: "+ searchEngineIndexListResp.body);

      //verify response contains name, displayName and indexDescription for each registered index
      try {
        let jsonArray = JSON.parse(searchEngineIndexListResp.body);
        let hasNameKey = Object.keys(jsonArray[0]).some(key => key === 'name');
        let hasdisplayNameKey = Object.keys(jsonArray[0]).some(key => key === 'displayName');
        let hasDescriptionKey = Object.keys(jsonArray[0]).some(key => key === 'indexDescription');

        const nameKeyResult = check( hasNameKey, {
            "Verify name key exists for index ": (r) => r == true
        });

        const displayNameKeyResult = check( hasdisplayNameKey, {
            "Verify displayName key exists for index ": (r) => r == true
        });

        const descriptionKeyResult = check( hasDescriptionKey, {
            "Verify description key exists for index ": (r) => r == true
        });

        if(!nameKeyResult)
          console.error("Name key was not found in index response. Response was "+ searchEngineIndexListResp.body)

        if(!displayNameKeyResult)
          console.error("displayName key was not found in index response. Response was "+ searchEngineIndexListResp.body)

        if(!descriptionKeyResult)
          console.error("indexDescription key was not found in index response. Response was "+ searchEngineIndexListResp.body)

      }
      catch(error){
        console.error(`Unexpected exception occured: ${error} processing the response body of list Index API`);
      }
    })
}
