import http from 'k6/http';
import { check, group } from 'k6';
import { ARDQ } from "../../../modules/const.js";

/* * Verify successful request for augmentation NSSI and Site info
 *
 *   @param {url} - The url of the micro-service
 */
export default function (url) {
  group('Verify Augmentation for NSSI and Site Info', function () {
    console.log('CARDQ Core: request augmentation nssi and site information');
    
    const expectedData = ARDQ.core.augRequestResponseDataForSiteAndNSSI;
    const augRequestData = ARDQ.core.augRequestResponseDataForSiteAndNSSI.aug_RequestData;
    let res;
    
    try {
      let endpoint_url = url + ARDQ.augmentationEndpoint;

      res = http.post(endpoint_url, JSON.stringify(augRequestData), {
      headers: { 'Content-Type': 'application/json' }
    });

    const result = check(res, {
      'Get CARDQ augmentation info (status: 200)': (r) => r.status === 200,
      'Check CARDQ response body (not empty)': (r) => r.body.length > 0
    });
    
    if (!result)
      console.error(`Unexpected status in CARDQ augmentation response. Status: ${res.status}\nResponse body: ${res.body}`);
    }
    catch (error){
      console.error(`Unexpected response from CARDQ Core Augmentation info endpoint: "${error}"`);
    }
    
    try {
      console.log('Response from CARDQ: ' + res.body);
      console.log('Length of response fields: ' + JSON.parse(res.body).fields.length);

      // Check that the correct nssi values were returned for the augmentation fields.
      const nssiResultBodyContent = check(res, {
        'Check response body contains NSSI and Site data (nssiName & nssiValue, siteName & siteValue)': (res) => {
          const response = JSON.parse(res.body);
          const fields = response.fields;

          let foundNSSIA1 = false;
          let foundNSSIA11 = false;
          let foundSite = false;

          fields.forEach(function (slices) {
            slices.forEach(function (networkSlice) {
              if (networkSlice.name == expectedData.nssiField && networkSlice.value == expectedData.nssiName[0]) {
                foundNSSIA1 = true;
              }
              else if  (networkSlice.name == expectedData.siteField && networkSlice.value == expectedData.site) {
                foundSite = true;
              }
              else if (networkSlice.name == expectedData.nssiField && networkSlice.value == expectedData.nssiName[1]){
                foundNSSIA11 = true;
              }
              console.log('Returned name-value' + JSON.stringify(networkSlice));
            });
          });
          return (foundNSSIA1 && foundNSSIA11 && foundSite);
        }
      });
      if (!nssiResultBodyContent) {
        console.error('Unexpected response in NSSI augmentation fields: ' + res.body);
        console.error(`Expected augmentation values for NSSI are: nssiField:${expectedData.nssiField}, nssiName:${expectedData.nssiName[0]} and ${expectedData.nssiName[1]}`);
        console.error(`Expected augmentation values for Site are: siteField:${expectedData.siteField}, siteValue:${expectedData.site}`);
      }
    }
    catch (error) {
      console.error(`Unexpected exception occurred: ${error} while processing response from CARDQ for NSSI and Site`);
    }
  });
}
