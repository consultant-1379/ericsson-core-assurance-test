########################################  healthStatus.js  ########################################
This suite contains testcases regarding the health status check for different microservices
Verifies health check returned successful 200 response code

# curl command for checking health status
microServiceURL + healthEndpoint

Health Status is verified for below microservices
1. CSAC
2. CARDQ
3. AAS
4. NAS
5. AIS
6. PM_QUERY
7. PM_Export
8. PM_Calc
9. ATN

########################################  metricsEndpoint.js  ########################################

This suite contains testcases regarding Prometheus Metrics Endpoint is accessible for the microservice under test

# curl command for checking healthStatus 

microServieURL + prometheusEndpoint

Prometheus Metrics Endpoint is verified for below microservices

1. CSAC
2. CARDQ
3. AAS
4. AIS
5. ATN

########################################  nasMetricsEndpoint.js  ########################################

This suite contains testcase regarding nas microservice end point is accessible and metrics count is greater than 0

# curl command for checking healthStatus 

microServieURL + nasMetricEndpoint   

NAS metric endpoint is  defined in const.js file ( NAS -->  metricEndpoint: '/metrics')
