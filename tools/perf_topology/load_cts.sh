#!/bin/bash

NAMESPACE=''
FUNCTION=''
SLICES='20'
NODES='10'
CELLS='3'

# Usage notes for help option or invalid use
print_usage() {
  echo 'Assurance performance topology loading tool'
  echo ' '
  echo "options:"
  echo "-h,    display parameters"
  echo "-f,    specify a function to run (all/config/copy/dynm/sync/info/rests/dup/tmpl)"
  echo "           all creates, copies, loads the topology info"
  echo "           config creates datasync file"
  echo "           dynm loads DAGs into CTS"
  echo "           sync loads datasync file into CTS"
  echo "           info grabs topology info from CTS"
  echo "           rests generates RESTSim templates, copies and loads them"
  echo "           dup creates RESTSim templates based on number of Nodes"
  echo "           tmpl copies and loads RESTSim templates in pm-solution-enm-1"
  echo "-n,    specify the namespace"
  echo "-g,    specify the number of nodes"
  echo "-c,    specify the number of cells"
  echo "-s,    specify the number of slices"
}
# Function to determine needed increase for plmn range for topo.py tool
plmn_check(){
    rangeVar=10
    mccRange=1
    mncRange=2
    sdRange=99
    sstRange=9
    PLMN=$(( $mccRange * $mncRange * $sdRange * $sstRange ))
    until [[ $PLMN -gt $SLICES ]]
    do
       rangeVar=$((rangeVar+5))
       sstRange=$(( $rangeVar - 1 ))
       PLMN=$(( $mccRange * $mncRange * $sdRange * $sstRange ))
    done
    return $rangeVar
}

# Setting variables based on user supplied inputs
while getopts 'f:n:c:g:s:h' flag; do
  case "${flag}" in
    f) FUNCTION="${OPTARG}" ;;
    n) NAMESPACE="${OPTARG}" ;;
    c) CELLS="${OPTARG}" ;;
    g) NODES="${OPTARG}" ;;
    s) SLICES="${OPTARG}" ;;
    h) print_usage
       exit 0 ;;
    *) print_usage
       exit 1 ;;
  esac
done

# Ensuring passed in function is valid and function & namespace are not empty
OPTIONS=('all' 'config' 'copy' 'dynm' 'sync' 'info' 'rests' 'dup' 'tmpl')
if [[ ! ${OPTIONS[@]} =~ $FUNCTION ]] || [ -z "$FUNCTION" ] || [ -z "$NAMESPACE" ]
then
     echo Invalid or empty function: $FUNCTION or empty namespace
     print_usage
     exit 1
fi

# Grab first CTS pod name
CTS=$(kubectl get pods -n ${NAMESPACE} -l app.kubernetes.io/name=eric-oss-cmn-topology-svc-core -o jsonpath="{range .items[?(@.status.phase=='Running')]}{.metadata.name}{'\n'}{end}")
CTS=($CTS)
PM='eric-oss-pm-solution-enm-1-0'

# Function to call the python script to generate the date, creating a config.yaml to pass in based on input parameters
if [ "$FUNCTION" == "all" ] || [ "$FUNCTION" == "config" ]; then
    echo Generating datasync files
    touch config.yml
    echo "topology:
    filepath: datasync
    filename: ran_topology
    name: ran_topology
    size: 45000
    comment: ScaledDataSet-For-Testing
    resourcePartitionSet: 10
    resourcePartition: 3
    plmnInfo:
        mccRange:
            min: 100
            max: 100
        mncRange:
            min: 101
            max: 103
        sdRange:
            min: 1
            max: 100
        sstRange:
            min: 1
            max: num
    slices: 10
    gnbdu: 2
    nrCell: 3
    " > config.yml
    echo Slices: ${SLICES} gnbdu: ${NODES} nrCell: ${CELLS}
    sed -i '' "s/slices:.*/slices: ${SLICES}/" 'config.yml'
    sed -i '' "s/resourcePartitionSet:.*/resourcePartitionSet: ${NODES}/" 'config.yml'
    sed -i '' "s/gnbdu:.*/gnbdu: ${NODES}/" 'config.yml'
    sed -i '' "s/nrCell:.*/nrCell: ${CELLS}/" 'config.yml'
    # Checks and increases sstRange value (replaces num) to ensure proper range for topology generation
    plmn_check
    range=$?
    sed -i '' "s/max: num/max: ${range}/" 'config.yml'
    python3 topo.py config.yaml
    # python3 topo_multi.py
fi
# Setting up file naming variables
DAGS=("DAG_ExternalRef.json" "DAG_RrpParameters.json" "DAG_SOA_NF.json" "DAG_SO_VNF.json")
SYNCS=("ran_topology.json")
DYNS=("ExternalRef" "RrpParameters" "SOA_NF" "SO_VNF")
# DELE=("ran_topology_delete.json")

# WIP for multi file topology generation
# cd datasync
# declare -a SYNCS
# for file in *.json
# do
#     SYNCS=("${SYNCS[@]}" "$file")
# done
# cd ..

# Function to copy all of the json files into the CTS pod
if [ "$FUNCTION" == "all" ] || [ "$FUNCTION" == "copy" ]; then
    echo Copying DAG and dataSync files into CTS pod
    if [ ! -f DAG_ExternalRef.json ] || [ ! -f DAG_RrpParameters.json ] || [ ! -f DAG_SOA_NF.json ] || [ ! -f DAG_SO_VNF.json ]; then
        echo "Missing DAG file(s)"
        exit -1
    fi
    for dyn in ${DAGS[@]}; do
        echo Copying ${dyn}
        kubectl -n ${NAMESPACE} cp ${dyn} ${CTS}:/tmp --container=eric-inventory-core
    done
    for data in ${SYNCS[@]}; do
        if [[ $data == *"delete"* ]]; then
            continue
        fi
        echo Copying ${data}
        # kubectl -n ${NAMESPACE} cp datasync/${data} ${CTS}:/tmp --container=eric-inventory-core
        kubectl -n ${NAMESPACE} cp ${data} ${CTS}:/tmp --container=eric-inventory-core
    done
fi

# Function to load the dynamic attributes into CTS only if they do not already exist
if [ "$FUNCTION" == "all" ] || [ "$FUNCTION" == "dynm" ]; then
    echo Loading Dynamic Attributes, DAG, into CTS
    echo Grabbing existing Attributes
    ATTR=$(kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -s -X GET -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" -H "Content-Type: application/json" http://eric-oss-cmn-topology-svc-core:8081/oss-core-ws/rest/oaf/dynamicattributegroupdefinition)

    for att in ${DYNS[@]}; do
        if [[ "$ATTR" == *"${att}"* ]]; then
            echo ${att} exists, skipping re-loading
        else
            echo Loading ${att}
            kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -s -X POST -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" -H "Content-Type: application/json" --data-binary @/tmp/DAG_${att}.json http://eric-oss-cmn-topology-svc-core:8081/oss-core-ws/rest/oaf/dynamicattributegroupdefinition
        fi
    done
fi

# Function to load the topology datasync file into CTS and print out the number of successful registered cells
if [ "$FUNCTION" == "all" ] || [ "$FUNCTION" == "sync" ]; then
    echo Loading datasync file into CTS
    for data in ${SYNCS[@]}; do
        if [[ $data == *"delete"* ]]; then
            continue
        fi
        echo Sending ${data}
        kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -X POST -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" -H "Content-Type: application/json" --data-binary @/tmp/${data} http://eric-oss-cmn-topology-svc-core:8081/oss-core-ws/rest/osl-adv/datasync/process
    done
    echo Number of registered nrCells
    kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -s -k -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" http://eric-oss-cmn-topology-svc-core:8080/oss-core-ws/rest/ctw/nrcellTask/count
fi

# Function to remove the topology data out of CTS - untested and not part of full data flow
if [ "$FUNCTION" == "clean" ]; then
    echo Removing datasync file data
    echo Copying over delete file
    for data in ${SYNCS[@]}; do
        if [[ $data == *"delete"* ]]; then
            echo Copying ${data}
            kubectl -n ${NAMESPACE} cp ${cle} ${CTS}:/tmp --container=eric-inventory-core
            echo Sending ${data}
            kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -X POST -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" -H "Content-Type: application/json" --data-binary @/tmp/${data} http://eric-oss-cmn-topology-svc-core:8081/oss-core-ws/rest/osl-adv/datasync/process
        fi
    done
fi

# Function for printing out the registered entities in CTS
if [ "$FUNCTION" == "info" ]; then
    ENT=("/ctg/geographicsite" "/ctw/networkslice" "/ctw/serviceprofile" "/ctw/networkslicesubnet" "/ctw/sliceprofile" "/ctw/plmninfo" "/ctw/ngcorenetfunction" "/ctw/ngrannode" "/ctw/gnbdu" "/ctw/gnbcucp" "/ctw/gnbcuup" "/ctw/nrcell" "/ctw/qosprofile" "/ctw/fiveqiset" "/ctw/fiveqiflow" "/ctw/resourcepartitionset" "/ctw/resourcepartition" "/ctw/resourcepartitionmember")
    for en in ${ENT[@]}; do
        TOTAL=$(kubectl exec ${CTS} --container=eric-inventory-core -n ${NAMESPACE} -- curl -s -k -H "Authorization: Basic c3lzYWRtOg==" -H "GS-Database-Name: eai_install" -H "GS-Database-Host-Name: localhost" "http://eric-oss-cmn-topology-svc-core:8080/oss-core-ws/rest${en}Task/count")
        echo Total ${en} = ${TOTAL}
    done
fi

# Function used to create the RESTSim template files based on the number of nodes
if [ "$FUNCTION" == "rests" ] || [ "$FUNCTION" == "dup" ]; then
    rm -R Templates/test
    mkdir Templates/test
    mkdir Templates/test/topo_sim
    echo Duplicating template files for ${NODES} nodes

    # Date variables
    DATE=$(date +%Y%m%d);
    DATE2=$(date +%Y-%m-%d);

    # Original Template file names from Templates/Perf_Base directory
    ORC="A20240315.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio1,ManagedElement=gNodeBRadio1_osscounterfile_CUCP_1.xml"
    ORD="A20240315.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio1,ManagedElement=gNodeBRadio1_osscounterfile_DU_1.xml"

    # Original Template file names updated with today's date
    CUCP="A${DATE}.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio1,ManagedElement=gNodeBRadio1_osscounterfile_CUCP_1.xml"
    DU="A${DATE}.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio1,ManagedElement=gNodeBRadio1_osscounterfile_DU_1.xml"

    # Copy original template files into new directory with today's date and replace date inside with current date
    cp Templates/Perf_Base/${ORC} Templates/test/${CUCP} && sed -i '' "s/2024-03-15/${DATE2}/g" "Templates/test/${CUCP}"
    cp Templates/Perf_Base/${ORD} Templates/test/${DU} && sed -i '' "s/2024-03-15/${DATE2}/g" "Templates/test/${DU}"

    # Loop through number of nodes starting at 2 since original bases are already present
    for i in $(seq 2 $NODES); do
        # Arithmetic to determine cell numbers to associate with current node value
        NUM1=$((${i} * 3 - 2))
        NUM2=$((${i} * 3 - 1))
        NUM3=$((${i} * 3))

        STR1="${i}-${NUM1}\""
        STR2="${i}-${NUM2}\""
        STR3="${i}-${NUM3}\""

        # New duplicated template name with current node iteration
        CUCP2="A${DATE}.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio${i},ManagedElement=gNodeBRadio${i}_osscounterfile_CUCP_1.xml"
        DU2="A${DATE}.0000+0000-0015+0000_SubNetwork=RAN,MeContext=gNodeBRadio${i},ManagedElement=gNodeBRadio${i}_osscounterfile_DU_1.xml"

        # Create duplicate or base with current node itteration value and replace occurances of node value with new one inside file
        cp Templates/test/${CUCP} Templates/test/${CUCP2} && sed -i '' "s/gNodeBRadio1/gNodeBRadio${i}/g" "Templates/test/${CUCP2}"
        cp Templates/test/${DU} Templates/test/${DU2} && sed -i '' "s/gNodeBRadio1/gNodeBRadio${i}/g" "Templates/test/${DU2}"

        # Update cell names/values in each file
        sed -i '' "s/gNodeBRadio${i}-1\"/gNodeBRadio${STR1}/" "Templates/test/${CUCP2}"
        sed -i '' "s/gNodeBRadio${i}-2\"/gNodeBRadio${STR2}/" "Templates/test/${CUCP2}"
        sed -i '' "s/gNodeBRadio${i}-3\"/gNodeBRadio${STR3}/" "Templates/test/${CUCP2}"
        sed -i '' "s/gNodeBRadio${i}-1\"/gNodeBRadio${STR1}/" "Templates/test/${DU2}"
        sed -i '' "s/gNodeBRadio${i}-2\"/gNodeBRadio${STR2}/" "Templates/test/${DU2}"
        sed -i '' "s/gNodeBRadio${i}-3\"/gNodeBRadio${STR3}/" "Templates/test/${DU2}"

        # Zip new xml files into xml.gz and move to topo_sim directory
        gzip Templates/test/${CUCP2}
        gzip Templates/test/${DU2}
        mv Templates/test/${CUCP2}.gz Templates/test/topo_sim
        mv Templates/test/${DU2}.gz Templates/test/topo_sim
    done
    # Zip base xml templates and move xml.gz to topo_sim directory
    gzip Templates/test/${CUCP}
    gzip Templates/test/${DU}
    mv Templates/test/${CUCP}.gz Templates/test/topo_sim
    mv Templates/test/${DU}.gz Templates/test/topo_sim

    # Move into test directory, tar the directory containing all the xml.gz files, move back out
    cd Templates/test
    tar -czf NR_EBSN_TEMPLATES.tar.gz topo_sim
    cd ../..
fi
if [ "$FUNCTION" == "rests" ] || [ "$FUNCTION" == "templ" ]; then
    echo "Copying and loading RESTSim templates into ${PM}"
    kubectl -n ${NAMESPACE} cp test/NR_EBSN_TEMPLATES.tar.gz ${PM}:/ --container=pm-generator
    kubectl exec ${PM} --container=pm-generator -n ${NAMESPACE} -- curl -X PUT -T NR_EBSN_TEMPLATES.tar.gz localhost:4545
fi