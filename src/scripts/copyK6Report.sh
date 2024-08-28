#!/bin/bash

# Function to copy k6 test results
copy_k6_results() {
    kubectl --namespace "${NAMESPACE}" --kubeconfig "${KUBECONFIG}" cp eca-k6-testsuite:/reports/summary.json "${REPORT_PATH}/summary.json" > /dev/null
    kubectl --namespace "${NAMESPACE}" --kubeconfig "${KUBECONFIG}" cp eca-k6-testsuite:/reports/test-output.json "${REPORT_PATH}/test-output.json" > /dev/null
    kubectl --namespace "${NAMESPACE}" --kubeconfig "${KUBECONFIG}" logs eca-k6-testsuite > "${REPORT_PATH}/podlogs.log"
    kubectl --namespace "${NAMESPACE}" --kubeconfig "${KUBECONFIG}" cp eca-k6-testsuite:/reports/result.html "${REPORT_PATH}/result.html"
}

# Function to delete resources
delete_resources() {
    echo "Deleting k6 resources."
    kubectl --namespace "${NAMESPACE}" delete pod eca-k6-testsuite
    kubectl --namespace "${NAMESPACE}" delete networkpolicy/eric-eca-k6-policy
    kubectl --namespace "${NAMESPACE}" delete internalcertificate.siptls.sec.ericsson.com eca-k6-testsuite-tls-cert
    kubectl --namespace "${NAMESPACE}" delete internalcertificate.siptls.sec.ericsson.com eca-k6-testsuite-kafka-cert
    kubectl --namespace "${NAMESPACE}" delete kafkausers.kafka.strimzi.io eca-k6-testsuite
    kubectl --namespace "${NAMESPACE}" delete internalcertificate.siptls.sec.ericsson.com eric-bos-assurance-topology-notification-kafka-cert
    kubectl --namespace "${NAMESPACE}" delete internalcertificate.siptls.sec.ericsson.com eric-pmserver-cert
}

# Usage: ./copyK6Report.sh <kubeconfig> <namespace> <report_path>

KUBECONFIG="$1"
NAMESPACE="$2"
REPORT_PATH="$3"

MAX_TOTAL_WAIT_TIME_SECONDS=6000
WAIT_INTERVAL_SECONDS=30        

current_total_wait_time=0
first_iteration=0

while [ "$current_total_wait_time" -le "$MAX_TOTAL_WAIT_TIME_SECONDS" ]; do
    start_time=$(date +%s)
    
    pod_status=$( kubectl get pods -n ${NAMESPACE} eca-k6-testsuite | sed -n '/\(\bSTATUS\)/!p' )
    completed_pod_check=$(echo "$pod_status" | sed -n '/\(Completed\)/!p')
    
    if [ "$completed_pod_check" == "" ]; then
        echo "Stop copying K6 test results; the pod is in a completed state."
        exit 1
    fi

    echo "Copying k6 test results..."
    copy_k6_results

    if [[ -f "${REPORT_PATH}/summary.json" && -f "${REPORT_PATH}/test-output.json" && -f "${REPORT_PATH}/result.html" && -f "${REPORT_PATH}/podlogs.log" ]]; then
        echo "All reports copied successfully."
        delete_resources
        exit 0
    fi

    end_time=$(date +%s)
    elapsed_time=$((end_time - start_time))
    ((current_total_wait_time += elapsed_time))

    if [ "$first_iteration" -eq 0 ]; then 
        time_left=$((MAX_TOTAL_WAIT_TIME_SECONDS - current_total_wait_time))
        ((first_iteration++))
    else
        ((current_total_wait_time += WAIT_INTERVAL_SECONDS))
    fi

    ((time_left=MAX_TOTAL_WAIT_TIME_SECONDS - current_total_wait_time))

    if [ "$current_total_wait_time" -ge "$MAX_TOTAL_WAIT_TIME_SECONDS" ]; then
        echo "Reached maximum wait time of $MAX_TOTAL_WAIT_TIME_SECONDS seconds. No report file available."
        delete_resources
        exit 1
    else
        echo "No reports available. Waiting for $WAIT_INTERVAL_SECONDS seconds before retrying. Time left: $time_left seconds."
        sleep "$WAIT_INTERVAL_SECONDS"
    fi
done

