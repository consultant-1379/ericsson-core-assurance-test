#!/usr/bin/env groovy
// package pipeline

def defaultBobImage = 'armdocker.rnd.ericsson.se/proj-adp-cicd-drop/bob.2.0:1.7.0-55'
def bob = new BobCommand()
    .bobImage(defaultBobImage)
    .envVars([
        HOME:'${HOME}',
        // ISO_VERSION:'${ISO_VERSION}',
        RELEASE:'${RELEASE}',
        // SONAR_HOST_URL:'${SONAR_HOST_URL}',
        // SONAR_AUTH_TOKEN:'${SONAR_AUTH_TOKEN}',
        GERRIT_CHANGE_NUMBER:'${GERRIT_CHANGE_NUMBER}',
        KUBECONFIG:'${KUBECONFIG}',
        K8S_NAMESPACE: '${K8S_NAMESPACE}',
        // USER:'${USER}',
        // SELI_ARTIFACTORY_REPO_USER:'${CREDENTIALS_SELI_ARTIFACTORY_USR}',
        // SELI_ARTIFACTORY_REPO_PASS:'${CREDENTIALS_SELI_ARTIFACTORY_PSW}',
        // SERO_ARTIFACTORY_REPO_USER:'${CREDENTIALS_SERO_ARTIFACTORY_USR}',
        // SERO_ARTIFACTORY_REPO_PASS:'${CREDENTIALS_SERO_ARTIFACTORY_PSW}',
    ])
    .needDockerSocket(true)
    .toString()


// Potential sample pipeline for future perf test Jenkins build
// DO NOT USE until system is configured and associated stories are complete
@Library('oss-common-pipeline-lib@dVersion-2.0.0-hybrid') _
pipeline {
    agent {
        label "common_agents"
    }
    options { timestamps () }
    environment {
        RELEASE = "true"
        KUBECONFIG = "${WORKSPACE}/.kube/config"
        // CREDENTIALS_SELI_ARTIFACTORY = credentials('SELI_ARTIFACTORY')
        // CREDENTIALS_SERO_ARTIFACTORY = credentials('SERO_ARTIFACTORY')
    }
    stages {
        stage('Prepare') {
            steps {
                // cleanWs()
                // sh 'git clean -xdff'
                // sh 'git clone ssh://gerrit.ericsson.se:29418/adp-cicd/bob/'
                // sh 'git submodule sync'
                // sh 'git submodule update --init --recursive'
                sh "${bob} --help"
            }
        }

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [[$class: 'CleanBeforeCheckout']], userRemoteConfigs: [[credentialsId: 'eoadm100-user-creds', url: 'https://gerrit.ericsson.se/OSS/com.ericsson.oss.air/ericsson-core-assurance-test']]])
                sh "chmod +x -R ${env.WORKSPACE}"

                // Tests that the specified test js file exists in the repo
                // This parameter will need to be configured as a parameter in the Jenkins job config with the default value being the standard main.js path
                // Depending on strategy, might use this parameter to tell the image in the K6 pod which main js file to use when running
                // sh "test -f ${params.PATH_TO_TEST_FILE}"
            }
        }

        // Might want to add a stage to check that the deployment for the app exists
        // Maybe making use of the healthcheck script used in the stub repos
        // stage('Check Deployment status'){
        //     steps{
        //         echo 'Checking for healthy deployment'
                    // script{
                    //     sh "${bob} healthcheck"
                    // }
        //     }
        // }

        stage('Performance Tests') {
            // environment {
            //     K8S_CLUSTER_ID = sh(script: "echo \${RESOURCE_NAME} | cut -d'_' -f1", returnStdout: true).trim()
            //     K8S_NAMESPACE = sh(script: "echo \${RESOURCE_NAME} | cut -d',' -f1 | cut -d'_' -f2", returnStdout: true).trim()
            // }
            stages{
                stage('Scale In/Out Tests'){
                    steps {
                        script{
                            withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]) {
                                sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                                // configFileProvider([configFile(fileId: "${env.K8S_CLUSTER_ID}", targetLocation: "${env.KUBECONFIG}")]) {}
                                sh "${bob} scale-tests"
                            }
                        }
                    }
                }
            }
        }

        // Depending on strategy, might need to add a condition based on parameter to determine which K6 pod gets deployed
        stage('K6 Testing') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]) {
                        sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/deployK6pod.sh ./kubeconfig.conf ${env.NAMESPACE}"
                        // sh "./src/scripts/deployK6pod.sh ./kubeconfig.conf ${env.NAMESPACE} ${param.PATH_TO_TEST_FILE}"
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
        stage('Verify Results') {
            steps {
                script{
                    logs=sh(script: "python3 -u ./src/scripts/verifyResults.py | grep Decision", returnStdout: true)
                    withCredentials([file(credentialsId: env.KUBECONFIG, variable: 'KUBECONFIG')]){
                        sh "install -m 600 ${KUBECONFIG} ./kubeconfig.conf"
                        sh "./src/scripts/copyPodlogs.sh ./kubeconfig.conf ${env.NAMESPACE} . '${logs}'"
                    }
                }
                sh "python3 -u ./src/scripts/verifyResults.py"
            }
        }
    }

    post {
        always {
            archiveArtifacts 'summary.json'
            archiveArtifacts 'podlogs.log'
            archiveArtifacts 'result.html'
            archiveArtifacts allowEmptyArchive: true, artifacts: "cardq_logs.log, csac_logs.log"
        }
    }
}

// More about @Builder: http://mrhaki.blogspot.com/2014/05/groovy-goodness-use-builder-ast.html
import groovy.transform.builder.Builder
import groovy.transform.builder.SimpleStrategy
@Builder(builderStrategy = SimpleStrategy, prefix = '')
class BobCommand {
    def bobImage = 'bob.2.0:latest'
    def envVars = [:]
    def needDockerSocket = false

    String toString() {
        def env = envVars
                .collect({ entry -> "-e ${entry.key}=\"${entry.value}\"" })
                .join(' ')

        def cmd = """\
            |docker run
            |--init
            |--rm
            |--workdir \${PWD}
            |--user \$(id -u):\$(id -g)
            |-v \${PWD}:\${PWD}
            |-v /etc/group:/etc/group:ro
            |-v /etc/passwd:/etc/passwd:ro
            |-v /proj/mvn/:/proj/mvn
            |-v \${HOME}:\${HOME}
            |${needDockerSocket ? '-v /var/run/docker.sock:/var/run/docker.sock' : ''}
            |${env}
            |\$(for group in \$(id -G); do printf ' --group-add %s' "\$group"; done)
            |--group-add \$(stat -c '%g' /var/run/docker.sock)
            |${bobImage}
            |"""
        return cmd
                .stripMargin()           // remove indentation
                .replace('\n', ' ')      // join lines
                .replaceAll(/[ ]+/, ' ') // replace multiple spaces by one
    }
}