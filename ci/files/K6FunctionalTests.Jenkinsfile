#!/usr/bin/env groovy
package pipeline

pipeline {
    agent {
        label "common_agents"
    }
    options { timestamps () }
    parameters {
        string(
            name: 'K6_VERSION',
            defaultValue: 'latest',
            description: 'Version of K6 tests to run'
        )
        string(
            name: 'KPI_TYPE',
            defaultValue: 'both',
            description: 'Specifies which kpi tests to run. e.g. RAN, Core or both'
        )
    }
    stages {
        stage('Prepare') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [[$class: 'CleanBeforeCheckout']], userRemoteConfigs: [[credentialsId: 'eoadm100-user-creds', url: 'https://gerrit-gamma.gic.ericsson.se/OSS/com.ericsson.oss.air/ericsson-core-assurance-test']]])
                sh "chmod +x -R ${env.WORKSPACE}"
            }
        }

        stage('K6 Testing') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]) {
                        sh "install -m 2700 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/deployK6pod.sh ./kubeconfig.conf ${env.NAMESPACE} ${params.K6_VERSION} ${params.KPI_TYPE}"
                    }
                }
            }
        }

        stage('Copy Report') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]) {
                        sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/copyK6Report.sh ./kubeconfig.conf ${env.NAMESPACE} ."
                    }
                }
            }
        }
        stage('Copy uS Pod Logs') {
            steps {
                script{
                    logs=sh(script: "python3 -u ./src/scripts/verifyResults.py | grep Decision", returnStdout: true)
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]){
                        sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/copyPodlogs.sh ./kubeconfig.conf ${env.NAMESPACE} . '${logs}'"
                    }
                }
            }
        }
        stage('Copy pods list') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]) {
                        sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/copyPodsList.sh ./kubeconfig.conf ${env.NAMESPACE} ."
                    }
                }
            }
        }
        stage('Verify Results') {
            steps {
                sh "python3 -u ./src/scripts/verifyResults.py"
            }
        }
    }

    post {
        always {
            archiveArtifacts 'summary.json'
            archiveArtifacts 'podlogs.log'
            archiveArtifacts 'result.html'
            archiveArtifacts allowEmptyArchive: true, artifacts: "cardq_logs.log, csac_logs.log, aas_logs.log, nas_logs.log, ais_logs.log, atn_logs.log, pmsc_logs.log, pmse_logs.log, pmsq_logs.log, atg_logs.log, ${env.NAMESPACE}_pods_list.log"
        }
    }
}
