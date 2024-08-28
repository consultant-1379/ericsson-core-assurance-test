// This is a sample perf test main.js file and should not be used in automation until corresponding pipeline has been set up

// In each of the testcase files, the parameter will need to be added for calculatePerf flag and a line to add the value to the custom metric will need to be done as well
// if (calculatePerf){
//   healthCheckDurationTrend.add(res.timings.duration, {tag1: 'Health Check Finished'})
// }
// OR
// if (calculatePerf){
//   useCaseDurationTrend.add(res.timings.duration, {tag1: 'Use Case Finished'})
// }

// The calls to the testcase in this file will also need to pass in the calculatePerf flag to the usecase files themselves.

// Custom metrics will also need to be imported into each testcase
// import {useCaseDurationTrend} from "../modules/custom_metrics.js"

// If we want to change which main.js file runs in the K6 pod, a new env variable will need to be added to the pod yaml file
// - name: MAIN_TEST_FILE
//    value: "./perf_main.js"

import { htmlReport } from '/modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js';
import { group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

import getHealthStatus from './use_cases/smoke/healthStatus.js';
import { getAndVerifyMetricsEndpointResponse } from './use_cases/sanity/metrics/metricsEndpoint.js';
import csacPmKpiVerification from './use_cases/smoke/csacPmKpiVerification.js';
import cardqAugInfoRequest from './use_cases/functional/cardqAugInfoRequest.js';
import { verifyApplicationSLOs } from './use_cases/sanity/metrics/SLOsVerification.js';

const CSAC_URL = `${__ENV.CSAC_URL}`; //example:'http://eric-oss-core-slice-assurance-cfg:8080'
const CARDQ_URL = `${__ENV.CARDQ_URL}`; //example:'http://eric-oss-core-reporting-dimension-query:8080'

const CSAC_METRICS = ['csac_pm_defs_dict_int_total',
  'csac_kpi_defs_dict_int_total',
  'csac_deployed_profile_defs_int_total',
  'csac_deployed_kpi_instances_int_total',
  'csac_provisioning_pmsc_time_seconds',
  'csac_provisioning_total_time_seconds',
  'csac_runtime_kpi_instance_errors_total'];


// For monitoring of SLOs related to application start and ready times.
// Each element represents SLO metric name and the agreed threshold value associated to the metrics.
const SLO_METRICS_VALUES = [['application_ready_time_seconds{main_application_class=\"com.ericsson.oss.air.CoreApplication\",}', '90'],
['application_started_time_seconds{main_application_class=\"com.ericsson.oss.air.CoreApplication\",}', '90']]

const CARDQ_METRICS = ['cardq_augmentation_response_seconds_bucket',
  'cardq_augmentation_response_seconds_max',
  'cardq_augmentation_response_seconds_count',
  'cardq_augmentation_response_seconds_sum',
  'cardq_augmentation_cached_count'];

export const options = {
  stages: [
    { target: 80, duration: '30s' },
    { target: 80, duration: '1m' },
    { target: 0, duration: '30s' },
  ],
  thresholds: {
    'http_req_duration': [
      'p(95)<600',
      'p(99)<1500'
    ],
    "Health Check Duration" :[
      "p(99)<750",
      "avg<700",
      "med<700"
    ],
    "Use Case Duration" :[
      "p(99)<400",
      "avg<400",
      "med<400"
    ]
  },
  // scenarios: {
  //   scenario1: {
  //     executor: 'per-vu-iterations',
  //     startTime: '0s',
  //     vus: 1,
  //     iterations: 1
  //   }
  // }
};

export default function () {
  getHealthStatus(CSAC_URL, "CSAC", false, true);
  getHealthStatus(CARDQ_URL, "CARDQ", false, true);
  getAndVerifyMetricsEndpointResponse(CSAC_URL, CSAC_METRICS, "CSAC", false, true);
  getAndVerifyMetricsEndpointResponse(CARDQ_URL, CARDQ_METRICS, "CARDQ", false, true);
  cardqAugInfoRequest(CARDQ_URL, true);
  csacPmKpiVerification(CSAC_URL, true);
  verifyApplicationSLOs (CSAC_URL, SLO_METRICS_VALUES, "CSAC", true);
}
//create html report for the tests.
export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    "/reports/result.html": htmlReport(data),
    "/reports/summary.json": JSON.stringify(data),
  };
}
