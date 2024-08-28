import http from 'k6/http';
import { check } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyIndexExistsInList } from '../../modules/ais/indexOperations.js';
import { searchEngineIndexList } from '../../modules/indexerSearchEngineIndexList.js';
import { searchEngineIndexFullContexts } from '../../modules/indexerFullContext.js';
import { getAndVerifyIndexValuesForFullContext } from '../../modules/indexerValuesForFullContext.js';


/**  verifyIndexerValue()
 *   verify kpi Data Metric Exists on the Indexer
 *   This function is used to verify the kpi data calculated by pmsch has reached indexer
 *   @param {aasIndexName} - Assurance index name
 *   @param {contextId} - Context Id of the kpi data
 */
export function verifyIndexerValue (aasIndexName,contextId) {

  // Verify the list of indexes has the newly added index
  verifyIndexExistsInList(AIS.url, AIS.assuranceIndexName);

  // Verifying the search-engine-index-list response of a SearchEngine Index
  searchEngineIndexList(AIS.url, AIS.assuranceIndexName);

  // Verifying the fullContexts response of a SearchEngine Index
  searchEngineIndexFullContexts(AIS.url, aasIndexName);

  // Verifying the ValuesForFullContext response of a SearchEngine Index
  getAndVerifyIndexValuesForFullContext (AIS.url, aasIndexName, contextId);
}

/**  getIndexerContextValue()
 *   This function is used to get the attribute value from full context result for the queried contextName
 *   @param {indexName} - Name of the assurance indexer
 *   @param {kpiName} - name of the kpi under test
 *   @param {indexFullContextName} - Full context name of the index
 *   @param {valueAttributeKey} - Attribute key who's value need to be returned
 *   @return {attributeValue} - Attribute value for the required attribute key
 */
export function getIndexerContextValue(indexName, kpiName, indexFullContextName, valueAttributeKey="valueDocumentName") {
  let fullContexts_url = AIS.url + AIS.indexValuesEndpoint;
  let getfullcontexts_params = new URL(fullContexts_url);
  getfullcontexts_params.searchParams.append('searchEngineIndexName', indexName);
  getfullcontexts_params.searchParams.append('fullContextName', indexFullContextName);
  //get search engine index fullcontexts
  const res = http.get(getfullcontexts_params.toString());
  try {
    // Check the response status and response body
    const resResult = check(res, {
      "Get FullContexts of the test SearchEngineIndex (status: 200)": (r) => r.status === 200,
      "Check indexer response body (not empty)": (r) => r.body.length > 0
    });
    if (!resResult) {
      if (res.status != 200) {
        console.error("Search Engine Index FullContexts returned unexpected status " + res.status);
        console.error("Search Engine Index FullContexts returned unexpected response body " + res.body);
      }
    }
    let jsonArray = JSON.parse(res.body);
    jsonArray = jsonArray.value;
    for (let i=0; i < jsonArray.length; i++) {
      if(jsonArray[i].name == kpiName) {
        return jsonArray[i][valueAttributeKey];
      }
    }
    console.error(`KPI validation failed due to context ${indexFullContextName} not found for ${kpiName}.` +
                  `AIS (values-for-fullcontext) response \n`+JSON.stringify(jsonArray))
  }
  catch (error) {
    console.error(`Unexpected exception occurred in indexer fullcontext: ${error}`);
  }
}
