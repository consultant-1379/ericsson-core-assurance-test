/* jshint esversion: 6 */
import http from 'k6/http';
import { check, group } from 'k6';
import { ARDQ } from "../../../modules/const.js";

/* * Verify successful request for augmentation info
 *
 *   @param {url} - The url of the micro-service
 */
export default function (url) {
  group('Verify Augmentation Info', function () {
    console.log('CARDQ RAN: request augmentation information');
    let res;
    
    try {
      let endpoint_url = url + ARDQ.augmentationEndpoint;

      res = http.post(endpoint_url, JSON.stringify(ARDQ.ran.ranInfoRequest.ran_RequestData), {
        headers: { 'Content-Type': 'application/json' }
      });
  
      const result = check(res, {
        'Get CARDQ RAN augmentation info (status: 200)': (r) => r.status === 200,
        'Check CARDQ RAN response body (not empty)': (r) => r.body.length > 0
      });
      if (!result)
        console.error("Get CARDQ RAN augmentation returned unexpected status, status is " + res.status + ".\n Response body: " + res.body);
    }
    catch (error) {
      console.error(`Unexpected response from CARDQ RAN Augmentation info endpoint: "${error}"`);
    }

   try {
      let fields = JSON.parse(res.body).fields;
      console.log('Response from CARDQ RAN: ' + res.body);
      console.log('Length of response fields: ' + fields.length);

      const resultBodyContent = check(res, {
        'Check response body contains CARDQ RAN data (name & value)': (res) => {
          const response = JSON.parse(res.body);
          const fields = response.fields;
          
          let foundNssi = false;
          let foundTac = false;
          let foundCellId = false;
      
          fields.forEach(function (slices) {
            slices.forEach(function (networkSlice) {
              if (networkSlice.name == ARDQ.ran.ranInfoRequest.nssiField && networkSlice.value == ARDQ.ran.ranInfoRequest.nssiName) {
                foundNssi = true;
              }
              else if (networkSlice.name == ARDQ.ran.ranInfoRequest.tacField && networkSlice.value == ARDQ.ran.ranInfoRequest.tacValue) {
                foundTac = true;
              }
              else if (networkSlice.name == ARDQ.ran.ranInfoRequest.cellIdField && networkSlice.value == ARDQ.ran.ranInfoRequest.cellIdValue) {
                foundCellId = true;
              }
              console.log('Returned name-value' + JSON.stringify(networkSlice));
            });
          });

          if (foundNssi && foundTac && foundCellId) {
            return true;
          }
        }
      });
      if (!resultBodyContent) {
        console.error('Request for augmentation fields returned unexpected response: ' + res.body);
        console.error(`Expected list of exact augmentation is: nssi ${ARDQ.ran.ranInfoRequest.nssiName}, 
          tac ${ARDQ.ran.ranInfoRequest.tacValue}, cellId ${ARDQ.ran.ranInfoRequest.cellIdValue}`);
      }
    }
    catch (error) {
      console.error(`Unexpected exception occurred: "${error}" processing response from CARDQ RAN`);
    }
  });
}
