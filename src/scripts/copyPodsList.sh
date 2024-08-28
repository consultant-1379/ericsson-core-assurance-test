#!/bin/bash
KUBECONFIG=$1
NAMESPACE=$2
REPORT_PATH=$3

echo "Collecting pods list with its QoS class values from '${NAMESPACE}' namespace"
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods -l='app.kubernetes.io/managed-by=Helm,app.kubernetes.io/instance=eric-service-assurance' -o custom-columns=NAME:.metadata.name,QOS:.status.qosClass --no-headers >> ${REPORT_PATH}/${NAMESPACE}_pods_list.log 2>&1

# Check if the 'kubectl get pods' command was successful
if [ $? -eq 0 ]; then
    echo "Pods list with its QoS class values saved in ${NAMESPACE}_pods_list.log"
else
    echo "Failed to retrieve pods list and its QoS class values from '${NAMESPACE}' namespace"
fi
