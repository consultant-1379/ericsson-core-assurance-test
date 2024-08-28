import http from 'k6/http';
import { check, group } from 'k6';

import { augSendRegistration } from './aasRegistration.js';
import { verifyList } from '../../../modules/datasets/aas/aasRequestBody.js';
import { AAS } from '../../../modules/const.js';

/** getListAndVerifyRegistrationIDsAndStatus
 * Verify Registered augmentation 
 */

export function getListAndVerifyRegistrationIDsAndStatus () {
  //register additional registrations to augmentation
  const augRegDataListJson = JSON.parse (verifyList);
  augRegDataListJson.forEach((registration) => {
    augSendRegistration(JSON.stringify(registration))
  });

  group("Verify Augmentation Registration Id Information", function () {
     let get_reg_endpoint_url = AAS.url + AAS.registerEndpoint + '/' + augRegDataListJson[0].ardqId;
     let list_reg_id_endpoint_url = AAS.url + AAS.registrationIdsEndpoint;
     const get_reg_response = http.get(get_reg_endpoint_url, {
      headers: { 'Content-Type': 'application/json' }
    });
    const get_list_reg_response = http.get(list_reg_id_endpoint_url, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Endpoint url is ${get_reg_endpoint_url}`);
    console.log(`Registration List Endpoint url is ${list_reg_id_endpoint_url}`);

    // Deregistering the registrations done above so that post upgrade phase is not impacted
    augRegDataListJson.forEach((registration) => {
      console.log("Sending deregistration request for ardq Id : " + registration.ardqId);
      http.del(AAS.url + AAS.registerEndpoint + '/' + registration.ardqId);
    });

    // Check that the correct list of augmentation registrations IDs are returned.
    try {
      console.log((get_list_reg_response));
      const registrationEndpointIdsResult = check(get_list_reg_response, {
        'Check endpoint IDs list (status: 200)': (r) => r.status === 200,
        'Check list contents (check Ids contents)': (r) => {
          const resBodyJSON = JSON.parse(r.body);

          let id_check_list = new Set (augRegDataListJson.map(reg => reg.ardqId));
          let matched_ids = new Set(resBodyJSON.filter(x => id_check_list.has(x)));
          return id_check_list.size === matched_ids.size
        },
        'Check endpoint response body (# of IDs > 1 )': (r) => JSON.parse (r.body).length > 1});

        if (!registrationEndpointIdsResult) {
          if (get_list_reg_response.status != 200) {
            console.error('Get registration ID status ' + get_list_reg_response.status);
            console.error('Get endpoint ID response body: ' + get_list_reg_response.body);
           }
        }
    }
    catch (error) {
      console.error(`Unexpected exception occurred in verifyAAugRegIDList: ${error}`)
    }

    // Check that a correct unique augmentation registration ID is returned.
    try {
      const registrationEndpointResult = check(get_reg_response, {
        'Check endpoint ID (status: 200)': (r) => r.status === 200,
        'Check endpoint response body (Registration cardq101)': (r) => {
          console.log(JSON.parse (r.body).ardqId);
          return JSON.parse (r.body).ardqId === augRegDataListJson[0].ardqId;
        },
        'Check endpoint response body for schemaMappings field (Registration cardq101)': (r) => {
          console.log(JSON.parse(r.body).schemaMappings);
          return (JSON.parse(r.body).schemaMappings[0].inputSchema != undefined &&
          JSON.parse(r.body).schemaMappings[0].outputSchema != undefined);
        }
      });
      console.log(registrationEndpointResult);
      console.log('Successful registered IDs are: ',JSON.stringify(augRegDataListJson[0]));

      if (!registrationEndpointResult) {
        if (get_reg_response.status != 200) {
          console.error('Get registration ID status ' + get_reg_response.status);
          console.error('Get endpoint ID response body: ' + get_reg_response.body);
         }
      }
    }
    catch (error) {
      console.error(`Unexpected exception occurred in verifyAAugRegIDList: ${error}`)
    }
  })
}
