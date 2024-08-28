#!/usr/bin/env groovy

def bob = 'python3 bob/bob2.0/bob.py -r ruleset2.0.yaml'

pipeline {
    agent {
        node {
            label NODE_LABEL
        }
    }

    options {
        timestamps()
        ansiColor('xterm')
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '50', artifactNumToKeepStr: '50'))
    }

    environment {
        CREDENTIALS_SELI_ARTIFACTORY = credentials('SELI_ARTIFACTORY')
        CREDENTIALS_SERO_ARTIFACTORY = credentials('SERO_ARTIFACTORY')
    }

    stages {

        stage('Prepare') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [
                        [name: "${GERRIT_PATCHSET_REVISION}"]
                    ],
                    extensions: [
                        [$class: 'SubmoduleOption',
                            disableSubmodules: false,
                            parentCredentials: true,
                            recursiveSubmodules: true,
                            reference: '',
                            trackingSubmodules: false],
                        [$class: 'CleanBeforeCheckout']
                    ],
                    userRemoteConfigs: [
                        [url: '${GERRIT_MIRROR}/OSS/com.ericsson.oss.air/ericsson-core-assurance-test']
                    ]
                ])
            }
        }

        stage ('Clean') {
            steps {
                archiveArtifacts allowEmptyArchive: true, artifacts: 'ruleset2.0.yaml, precodereview.Jenkinsfile'
                sh "${bob} clean"
            }
        }

        stage('Init') {
            steps {
                script {
                    sh "${bob} init"
                    authorName = sh(returnStdout: true, script: 'git show -s --pretty=%an')
                    currentBuild.displayName = currentBuild.displayName + ' / ' + authorName
                }
            }
        }

        stage('Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'SELI_ARTIFACTORY', usernameVariable: 'SELI_ARTIFACTORY_REPO_USER', passwordVariable: 'SELI_ARTIFACTORY_REPO_PASS')]) {
                    ansiColor('xterm') {
                        sh "${bob} build"
                    }
                }
            }
        }

    }
    post {
        always {
            publishHTML (target: [
                allowMissing: true,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: "build/generated_docs",
                reportFiles: 'index.html',
                reportName: "Repository Documentation"
            ])
            archiveArtifacts allowEmptyArchive: true, artifacts: 'ruleset2.0.yaml, precodereview.Jenkinsfile'

        }
    }
}