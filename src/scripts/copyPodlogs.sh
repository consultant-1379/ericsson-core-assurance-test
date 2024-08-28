#!/bin/bash

# Script Purpose: This script collects logs for various microservices running in a Kubernetes cluster.
# It iterates through a list of microservices and retrieves logs for each one, storing them in separate log files.

# Define variables.
KUBECONFIG=$1
NAMESPACE=$2
REPORT_PATH=$3
DECISION=$4

# Function to collect logs for a specific service.
collect_logs() {
    local service=$1
    local log_file=""

    case $service in
        "eric-oss-core-reporting-dimension-query")
            log_file="${REPORT_PATH}/cardq_logs.log"
            ;;
        "eric-oss-core-slice-assurance-cfg")
            log_file="${REPORT_PATH}/csac_logs.log"
            ;;
        "eric-oss-assurance-augmentation")
            log_file="${REPORT_PATH}/aas_logs.log"
            ;;
        "eric-oss-network-assurance-search")
            log_file="${REPORT_PATH}/nas_logs.log"
            ;;
        "eric-bos-assurance-topology-notification")
            log_file="${REPORT_PATH}/atn_logs.log"
            ;;
        "eric-oss-assurance-indexer")
            log_file="${REPORT_PATH}/ais_logs.log"
            ;;
        "eric-oss-pm-stats-calculator")
            log_file="${REPORT_PATH}/pmsc_logs.log"
            ;;
        "eric-oss-pm-stats-exporter")
            log_file="${REPORT_PATH}/pmse_logs.log"
            ;;
        "eric-oss-pm-stats-query-service")
            log_file="${REPORT_PATH}/pmsq_logs.log"
            ;;
        "eric-bos-neo4j-graphdb")
            log_file="${REPORT_PATH}/atg_logs.log"
            ;;
        *)
            echo "Unknown service: $service"
            return 1
            ;;
    esac

    local pods=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pod --selector=app.kubernetes.io/name=${service} -o name --field-selector='status.phase=Running' | grep ${service} 2>&1)

    if [ -z "$pods" ]; then
        echo "Unable to get pods for ${service}, skipping log collection" >&2
    else
        echo "Copying logs from ${service} pods"
        for pod in $pods; do
            echo ${pod} >> ${log_file}
            if [[ "$service" == "eric-bos-neo4j-graphdb" ]]; then
                kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${pod} -c neo4j-graphdb >> ${log_file}
            else
                kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${pod} >> ${log_file}
            fi
        done
    fi
}

# Check decision and skip log collection if passed.
DES=$(echo $DECISION | cut -d ' ' -f 3)
if [[ "$DES" == "Pass" ]]; then
    echo "All tests passed, skipping microservice pod log collection"
    exit 0
fi

# Collect logs for each service individually.
services=("eric-oss-core-reporting-dimension-query" "eric-oss-core-slice-assurance-cfg" "eric-oss-assurance-augmentation" "eric-oss-network-assurance-search" "eric-bos-assurance-topology-notification" "eric-oss-assurance-indexer" "eric-oss-pm-stats-calculator" "eric-oss-pm-stats-exporter" "eric-oss-pm-stats-query-service" "eric-bos-neo4j-graphdb")

for service in "${services[@]}"; do
    collect_logs $service
done