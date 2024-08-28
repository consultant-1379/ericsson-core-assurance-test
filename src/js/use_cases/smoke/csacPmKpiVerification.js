import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';
import { check, group} from 'k6';
import { getMetricValue, getPrometheusResponse } from '../../modules/utils.js';
import { PM_KPI } from '../../modules/const.js';

/*
This function is checking response from 4 different endpoints of CSAC Microservice.
It also validates if the response body has atleast 1 definition available in CSAC.
*/

export default function (csac_url) {
  group('Verify KPI Instantiation', function () {
    console.log('CSAC PM DEF verification');
    let endpoint_url = csac_url + PM_KPI.pmDefEndpoint;
    let endpointDescription = 'PM DEF';
    responseCheck(endpoint_url, endpointDescription);

    console.log('CSAC KPI DEF verification');
    endpoint_url = csac_url + PM_KPI.kpiDefEndpoint;
    endpointDescription = 'KPI DEF';
    responseCheck(endpoint_url, endpointDescription);

    console.log('CSAC Profile verification');
    endpoint_url = csac_url + PM_KPI.profileEndpoint;
    endpointDescription = 'Profile';
    responseCheck(endpoint_url, endpointDescription);

    let res = getPrometheusResponse(csac_url, PM_KPI.failedKpiInstantiationMetric);
    let actualCount = "";
    const result = check(res, {
      ['Check failed instantiation metric count (count=' + PM_KPI.failedKpiInstantiationCount + ')']: (r) => {
        actualCount = getMetricValue(res, PM_KPI.failedKpiInstantiationMetric);
        if (actualCount != PM_KPI.failedKpiInstantiationCount) {
          return false;
        }
        else {
          return true;
        }
      }
    });
    if (!result)
      console.error('Actual count for failed kpi instantiation ' + actualCount + ' does not meet expected value ' + PM_KPI.failedKpiInstantiationCount);
  });
}

function responseCheck(url, endpoint) {
  const url_params = new URL(url);
  url_params.searchParams.append('start', PM_KPI.start);
  url_params.searchParams.append('rows', PM_KPI.rows);
  const res = http.get(url_params.toString());

  try {
    const result = check(res, {
      ['Get CSAC PM, KPI and Profile endpoints (status: 200)']: (r) => r.status === 200,
      ['Check endpoint response body content (count >= 1)']: (r) => JSON.parse(r.body).count >= 1
    });
    if (!result) {
      if (res.status != 200)
        console.error("Get " + url + " endpoint returned unexpected status " + res.status + ".\n Response body: " + res.body);

      if (JSON.parse(res.body).count < 1)
        console.error("Count is less than 1 for " + url + " endpoint.\n Response body: " + res.body);
    }
  }
  catch (error) {
    console.error(`Unexpected exception occurred: ${error} processing response for CSAC PM KPI verification`);
  }
}
