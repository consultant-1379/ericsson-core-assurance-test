import http from "k6/http";
import { check, group } from "k6";
import { NAS } from "../../modules/const.js";

/**
 *  Verify Network Assurance Web Application can hit Search Microservice Endpoint
 *  to get the available contexts, metrics and relations from Indexer
 *  @param {url} - NAS assurance micro-service url
 */
export function verifyAssuranceSearchCanReachIndexer(URL){
  // Search Microservice is issuing request to find all contexts metadata from Indexer
  group('Verify Network Search can get the available combined contexts data for a given index', function () {
    let discovery_endpoint_url = URL + NAS.discoveryEndpoint;
    const res = http.get(discovery_endpoint_url);

    console.log('Verify Network Search can get the available combined contexts data for a given index ' + discovery_endpoint_url);

    try {

      const searchIndexerResult = check(res, {
        "Get network search indexer (status: 200)": (r) => r.status === 200,
        "Check network search indexer response body (not empty)": (r) => r.body.length > 0
      });

      if (!searchIndexerResult) {
        if (searchIndexerResult.status != 200) {
          console.error("Network search indexer returned unexpected status " + searchIndexerResult.status);
          console.error("Network search indexer response body " + searchIndexerResult.body);
        }
      }

      const resultBodyContent = check(res, {
        'Check response body contains combined metadata (context, metrics & relations)': (res) => {
          const jsonArray = JSON.parse(res.body);

          for (let i = 0; i < jsonArray.length; i++){
            let foundRelations = false;
            // Check relations related contextField "id": "c_NF"
            if(jsonArray[i].relations.length > 0){
              jsonArray[i].relations.forEach(relation => {
                if(relation.related.contextFields.some(contextField => contextField.id === 'c_NF')){
                  foundRelations = true;
                }
              });
            }
            let foundContextFieldNameNSSAI = false;
            // Check contextFields "id":"c_NSI"
            if(jsonArray[i].contextType.contextFields.some(contextField => contextField.id === 'c_NSI')){
              foundContextFieldNameNSSAI = true;
            }
            let foundMetricTypeName = false;
            // Check metricTypes "id":"vi_NF_NSI_AMFMeanRegNbr"
            if(jsonArray[i].metricTypes.some(metricType => metricType.id === 'vi_NF_NSI_AMFMeanRegNbr')){
              foundMetricTypeName = true;
            }
            if (foundRelations && foundContextFieldNameNSSAI && foundMetricTypeName){
              return true;
            }
          }
       }
     });
      if (!resultBodyContent) {
        console.error("Metadata is not found in response body: " + res.body);
      }
    }
    catch(error){
      console.error(`Unexpected exception occurred in verifyAssuranceSearchCanReachIndexer: ${error}`);
    }
  });
}
