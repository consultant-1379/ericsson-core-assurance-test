#!/bin/bash
KUBECONFIG=$1
NAMESPACE=$2
VERSION=$3
KPITYPE=$4

kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/network-policy/eric-eca-k6-networkpolicy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/eca-secret.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/main/templates/eca-k6-internal-certificate-sip-tls.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/main/templates/kafkaCertificate.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/main/templates/kafkaUser.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/main/templates/kafkaMessageCert.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f deployment/charts/main/templates/pmServercert.yaml;
template=`cat deployment/charts/eca-k6pod.yaml | sed -e "s/:latest/:$VERSION/g" -e "s/both/$KPITYPE/g"`
echo "$template" | kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f -
sleep 40
