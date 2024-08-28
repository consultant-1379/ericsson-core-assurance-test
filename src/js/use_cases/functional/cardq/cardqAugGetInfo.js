/* jshint esversion: 6 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { ARDQ } from "../../../modules/const.js";

/* * Verify successful request for augmentation info
 *
 *   @param {url} - The url of the micro-service
 */
export default function (url) {
  group('Verify Augmentation Info', function () {
    console.log('CARDQ Core: request augmentation information');
    let res;

    try {
      let endpoint_url = url + ARDQ.augmentationEndpoint;

      res = http.post(endpoint_url, JSON.stringify(ARDQ.core.augInfoRequest.aug_RequestData), {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = check(res, {
        'Get CARDQ augmentation info (status: 200)': (r) => r.status === 200,
        'Check CARDQ response body (not empty)': (r) => r.body.length > 0
      });
      if (!result)
        console.error("Get CARDQ augmentation returned unexpected status, status is " + res.status + ".\n Response body: " + res.body);
    }
    catch (error) {
      console.error(`Unexpected response from CARDQ Augmentation info endpoint: "${error}"`);
    }

    // Check that the correct values were returned for the augmentation fields.
    try {
      console.log('Response from CARDQ: ' + res.body);
      console.log('Length of response fields: ' + JSON.parse(res.body).fields.length);

      const resultBodyContent = check(res, {
        'Check response body contains CARDQ data (nssi, site and plmnId)': (res) => {
          const response = JSON.parse(res.body);
          const fields = response.fields;

          let foundNssiC13 = false;
          let foundNssiC1 = false;
          let foundSite = false;
          let foundPlmn = false;

          fields.forEach(function (slices) {
            slices.forEach(function (networkSlice) {
              if (networkSlice.name == ARDQ.core.augInfoRequest.nssiField && networkSlice.value == ARDQ.core.augInfoRequest.nssiName[0]) {
                foundNssiC13 = true;
              }
              else if (networkSlice.name == ARDQ.core.augInfoRequest.plmnIdField && networkSlice.value == ARDQ.core.augInfoRequest.plmnIdName) {
                foundPlmn = true;
              }
              else if (networkSlice.name == ARDQ.core.augInfoRequest.siteField && networkSlice.value == ARDQ.core.augInfoRequest.siteName) {
                foundSite = true;
              }
              else if (networkSlice.name == ARDQ.core.augInfoRequest.nssiField && networkSlice.value == ARDQ.core.augInfoRequest.nssiName[1]) {
                foundNssiC1 = true;
              }
              console.log('Returned name-value' + JSON.stringify(networkSlice));
            });
          });

          if (foundNssiC13 && foundPlmn && foundSite && foundNssiC1) {
            return true;
          }
        }
      });
      if (!resultBodyContent) {
        console.error('Request for augmentation fields returned unexpected response: ' + res.body);
        console.error(`Expected list of exact augmentation is: nssi ${ARDQ.core.augInfoRequest.nssiName}, plmnId ${ARDQ.core.augInfoRequest.plmnIdName}, site ${ARDQ.core.augInfoRequest.siteName}`);
      }
    }
    catch (error) {
      console.error(`Unexpected exception occurred: "${error}" processing response from CARDQ`);
    }
  });
}
