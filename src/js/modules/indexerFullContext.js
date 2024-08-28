import http from "k6/http";
import { check, group, sleep } from "k6";
import { AIS } from './const.js';

/**
 * Query Search Engine Index FullContexts and verify response contains
 * documentName, fullContext and validate if the fullContext has atleast one context.
 * @param {url} - The url of the micro-service
 * @param {searchEngineIndexName} - The name of the Search Engine Index as per the
 *        Index Spec in src/js/modules/datasets/ais/index_building_specification.json
 */
export function searchEngineIndexFullContexts(url, searchEngineIndexName) {
  group("Verify Search Engine Index FullContexts Endpoint response", function () {
      let fullContexts_url = url + AIS.fullContextsEndpoint;
      let getfullcontexts_params = new URL(fullContexts_url);
      getfullcontexts_params.searchParams.append('searchEngineIndexName', searchEngineIndexName);
      console.log("SearchEngineIndex FullContexts endpoint is " + getfullcontexts_params.toString());

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
      
      //verify if the search engine index fullcontexts have mandatory keys
       check(jsonArray, {
        "Check response body contains mandatory fields (documentName, fullContext, fullContext->name, fullContext->context, context->name, context->documentName)": (arr) => {
          
          return arr.every(document => {
            if (document.documentName && document.fullContext.length > 0) {
              return document.fullContext.every (fullContext => {
                  if(fullContext.name && fullContext.context.length > 0) {
                    return fullContext.context.every (context => {
                      if(!context.name && !context.documentName){
                        if (!context.name) console.error ("fullContext->context->name key was not found in AIS fullcontext response. Response was " + res.body );
                        if (!context.documentName) console.error ("fullContext->context->documentName key was not found in AIS fullcontext response. Response was " + res.body );
                        return false;
                      }
                      else {
                        return true;
                      }
                    });
                  }
                  else {
                    console.error("fullContext->name or fullContext->context keys were not found in AIS fullcontext response. Response was " + res.body );
                    return false;
                  }
                });
            }
            else {
              console.error ("documentName key was not found in AIS fullcontext response. Response was " + res.body );
              return false;
            }
           });
        }
       });
       
      }
      catch (error){
        console.error(`Unexpected exception occurred in indexer fullcontext: ${error}`);
      }
  });
}
