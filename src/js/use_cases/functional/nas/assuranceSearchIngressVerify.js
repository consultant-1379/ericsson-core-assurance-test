import http from 'k6/http';
import { check, group, } from 'k6';
import { NAS } from "../../../modules/const.js";

//Prerequisites of the test will be resolved in other tickets for FQDN, user in NAS group and client secret

/* Verify status of Assurance Visualization application services through the ingress
** using FQDN of the cluster instead of NAS service name 
 */
export default function () {
  group('Verify Keycloak token is received and NAS accessible', function () {

    const requestBody = {
      client_id: 'authn-proxy',
      grant_type: 'password',
      username: 'ESOA-Admin',
      client_secret: 'yky6OMxdgHjzi57TwAa7R7u1DW5WIGmN',
      password: 'Ericsson123!'
    };

    const response = http.post(NAS.keycloakUrl, requestBody);

    console.log(response.json());
    let token = response.json().access_token;
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const res = http.get("https://aaug.hall147-sm3.ews.gic.ericsson.se/ui", params);
    let result = check (res, {
      'NAS UI endpoint reachability through ingress (status: 200)': (r) => r.status === 200
    });

    if (!result)
      console.log("Response: " + JSON.stringify(res));
  });
}
