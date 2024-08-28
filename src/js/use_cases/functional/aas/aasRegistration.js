import http from 'k6/http';
import { AAS } from '../../../modules/const.js';

/** augSendRegistration
 *   Register an augmentation with AAS
 *   @param {regData} - Data to use in body of request
 *   @param {type} - defauts to ADD, valid values: ADD, UPDATE
 *
 */

export function augSendRegistration(regData, type = "ADD") {

    let endpoint_url = AAS.url + AAS.registerEndpoint;
  
    console.log ("Augmentation Registration Request of type" + type + " data : " + regData + " to be sent to "+endpoint_url);
    let regResponse;
    if (type == "ADD") {
      regResponse = http.post(endpoint_url, regData, {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (type == "UPDATE") {
      regResponse = http.put(endpoint_url, regData, {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error("Invalid Augmentation Request Type: " + type);
    }
  
    return regResponse;
  }
