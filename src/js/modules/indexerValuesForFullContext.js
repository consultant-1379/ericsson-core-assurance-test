import http from "k6/http";
import { check, group } from "k6";
import { AIS } from './const.js';


/* * Get metadata for a given context name
 *
 *   @param {url} - The url of the AIS µs
 *   @param {searchEngineIndexName} - search engine index name
 *   @param {contextName} - expected context name
 *   @return {contextExists} - Return true if contextName exists
 */
export function getAndVerifyIndexValuesForFullContext (url, searchEngineIndexName, contextName=AIS.fullContextName) {
  // Indexer microservice is issuing request to find all mandatory values for fullcontext from Indexer
  let contextExists = false;
  group('Verify Search Engine Index values-for-fullcontext Endpoint response', function () {
    let getValuesForFullContext_params = new URL (url + AIS.indexValuesEndpoint);
    getValuesForFullContext_params.searchParams.append('searchEngineIndexName', searchEngineIndexName);
    getValuesForFullContext_params.searchParams.append('fullContextName', contextName);
    console.log('Indexer values-for-fullcontext endpoint is ' + getValuesForFullContext_params.toString());
    //get search engine index values-for-fullcontexts
    const res = http.get(getValuesForFullContext_params.toString());
    console.log('Response for values-for-fullcontexts endpoint is '+res.body);
    try {
      const searchIndexerResult = check(res, {
        'Get indexer values-for-fullcontext (status: 200)': (r) => r.status === 200,
        'Check indexer values-for-fullcontext response body (not empty)': (r) => r.body.length > 0
      });
      if (!searchIndexerResult) {
        if (searchIndexerResult.status != 200) {
          console.error('Indexer values-for-fullcontext request failed with ' + searchIndexerResult + ' response');
        }
      }
      const resultValue = check (res, {
        'Check key named value is not empty': (res) => {
          const response = JSON.parse(res.body);
          return response.value.length > 0;
        }
      });

      if (!resultValue) {
        console.error('Value attribute of values-for-fullcontext is empty. '+res.body);
      }
      //verify if the search engine index values-for-fullcontexts have mandatory value key fields
      const resultBodyContent = check(res, {
        'Check response body contains fullContext mandatory value key fields (value keys)': (res) => {
          const bodyJSONString = res.body;
          const response = JSON.parse(bodyJSONString);
          const responseValue = response.value;
         return responseValue.every(value => {
            if (value.name && value.valueContextDocumentName && value.valueDocumentName) {
              contextExists = true;
              return true;
            }
            else {
                console.error ('Missing mandatory value in', value);
                if (!value.name) console.error ('Missing field - name');
                if (!value.valueContextDocumentName) console.error ('Missing field - valueContextDocumentName');
                if (!value.valueDocumentName) console.error ('Missing field - valueDocumentName');
            }
          });
       }
     });
      if (!resultBodyContent) {
        console.error('Some indexer values-for-fullcontext API is not found in response body: ' + res.body);
      }
    }
    catch(error){
      console.error(`Unexpected exception occurred in indexer values-for-fullcontext: ${error}`);
    }
  });
  return contextExists;
}
