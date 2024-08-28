from datetime import datetime
import json
import random
import uuid 
import yaml

with open("config.yml", "r") as f:
    config = yaml.load(f, Loader=yaml.Loader)


comment=config['topology']['comment']
filename=config['topology']['name']
# plmnInfo configuration
mcc_min=config['topology']['plmnInfo']['mccRange']['min'] 
mcc_max=config['topology']['plmnInfo']['mccRange']['max'] 
mnc_min=config['topology']['plmnInfo']['mncRange']['min'] 
mnc_max=config['topology']['plmnInfo']['mncRange']['max'] 
sd_min=config['topology']['plmnInfo']['sdRange']['min'] 
sd_max=config['topology']['plmnInfo']['sdRange']['max'] 
sst_min=config['topology']['plmnInfo']['sstRange']['min'] 
sst_max=config['topology']['plmnInfo']['sstRange']['max']


resourcePartitionSet=config['topology']['resourcePartitionSet']     # Number of resourcePartitionSet
resourcePartition=config['topology']['resourcePartition']           # Number of resourcePartition per resourcePartitionSet
resourcePartitionMember=resourcePartitionSet * resourcePartition    # Number of resourcePartitionMember
slices=config['topology']['slices']                                 # Number of networkSlices / serviceProfile                      # Number of networkSliceSubnet per networkSlices
qoss=int(slices/2)
gnbdus=config['topology']['gnbdu']
nrCells=config['topology']['nrCell']  
sliceType=[
        "eMBB",
        "MIoT"
    ]

plmnInfoStore = []
networkSliceSubnetStore = []
stStore = []
nrCellStore = []


def generate_random_topology():
    topology = {
        "type": "osl-adv/datasyncservice/process",
        "jsonHolder": {
            "type": "gs/jsonHolder",
            "json": []
            }
    }   
            
# Generating entities plmnInfo
    for mcc in range(mcc_min, mcc_max+1):  
        for mnc in range(mnc_min, mnc_max+1):
            for sd in range(sd_min, sd_max+1):
                for sst in range(sst_min, sst_max+1):
                    plmnInfo = "PlmnInfo:"+str(mcc)+"-"+str(mnc)+"|"+str(sd)+"-"+str(sst)
                    plmnInfoStore.append(plmnInfo)  
                    function ={
                        "$action":      "reconcile",
                        "$type":        "ctw/plmnInfo",
                        "$refId":       plmnInfo,
                        "name":         plmnInfo,
                        "comments":     comment,
                        "status":       "operating",
                        "plmn_mcc":     str(mcc),
                        "plmn_mnc":     str(mnc),
                        "sNSSAI_SD":    str(sd),
                        "sNSSAI_SST":   str(sst),
                        "dynamicAttributes": [
                        ]
                    }
                    topology["jsonHolder"]["json"].append(function)
 
 
 # Generating entities resourcePartitionMember
    for rpm in range(1, resourcePartitionMember+1):
        function ={
            "$action":      "reconcile",
            "$type":        "ctw/resourcePartitionMember",
            "$refId":       "resourcePartitionMember:RPM-"+str(rpm),
            "name":         "resourcePartitionMember:RPM-"+str(rpm),
            "comments":     comment,
            "status":       "operating",
            "$plmnInfoList": [
                plmnInfoStore[rpm-1]
            ]
        }
        topology["jsonHolder"]["json"].append(function)
        
 # Generating entities resourcePartition
    for rp in range(1, resourcePartitionMember+1):
        function ={
            "$action":      "reconcile",
            "$type":        "ctw/resourcePartition",
            "$refId":       "resourcePartition:RP-"+str(rp),
            "name":         "resourcePartition:RP-"+str(rp),
            "comments":     comment,
            "status":       "operating",
            "$resourcePartitionMembers": [
                    "resourcePartitionMember:RPM-"+str(rp)
            ]
        }
        topology["jsonHolder"]["json"].append(function)
        
# Generating entities resourcePartitionSet
    for rps in range(1, resourcePartitionSet+1):
        function ={
            "$action":      "reconcile",
            "$type":        "ctw/resourcePartitionSet",
            "$refId":       "resourcePartitionSet:RPS-"+str(rps),
            "name":         "resourcePartitionSet:RPS-"+str(rps),
            "comments":     comment,
            "status":       "operating",
            "$resourcePartitions": resource_partitions(rps, resourcePartition)
        }
        topology["jsonHolder"]["json"].append(function)
        
 # Generating entities networkSlice
    for slice in range(1, slices+1):
        st = random.randint(1, len(sliceType))
        stStore.append(st)
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/networkSlice",
            "$refId":       "NetworkSlice:NSI-"+str(slice),
            "name":         "NetworkSlice:NSI-"+str(slice),
            "comments":     comment,
            "status":       "operating",
            "type":         st,
            "dynamicAttributes": [

            ]
        }
        topology["jsonHolder"]["json"].append(function)
        
        
# Generating entities serviceProfile 
    for slice in range(1, slices+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/serviceProfile",
            "$refId":       "ServiceProfile:SP-"+str(slice),
            "name":         "ServiceProfile:SP-"+str(slice),
            "comments":     comment,
            "status":       "operating",
            "latency":      (5 if (slice % 5) == 0 else (slice % 5))*10,
            "$plmnInfoList":
            [
                    plmnInfoStore[slice-1]
            ],
            "$networkSliceHasRequirement":
            [
                    "NetworkSlice:NSI-"+str(slice)
            ],
            "$networkSliceHasCapability":
            [
                    "NetworkSlice:NSI-"+str(slice)
            ],
            "dynamicAttributes": [

            ]
        }
        topology["jsonHolder"]["json"].append(function)
        
# Generating entities networkSliceSubnet         
    for slice in range(1, slices+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/networkSliceSubnet",
            "$refId":       "NetworkSliceSubnet:NSSI-"+str(slice),
            "name":         "NetworkSliceSubnet:NSSI-"+str(slice),
            "comments":     comment,                
            "status":       "operating",
            "$aggregateEntities":
            [

            ],
            "$networkSlice":
            [
                    "NetworkSlice:NSI-"+str(slice)
            ],
            "dynamicAttributes": 
            [

            ]
        }
        topology["jsonHolder"]["json"].append(function)
            
# Generating entities sliceProfile         
    for slice in range(1, slices+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/sliceProfile",
            "$refId":       "SliceProfile:SP-"+str(slice),
            "name":         "SliceProfile:SP-"+str(slice),
            "comments":     comment,                
            "status":       "operating",
            "serviceType" : sliceType[stStore[slice-1]-1],
            "serviceFunction" : "RAN",
            "resourceSharingLevel" : "NON-SHARED",
            "maxNumberofUEs" : (5 if (slice % 5) == 0 else (slice % 5))*10,
            "latency":      (5 if (slice % 5) == 0 else (slice % 5))*10,
            "dLThptPerSliceSubnetGuaThpt" : 6.0,
            "dLThptPerUEPerSubnetGuaThpt" : 3.0,
            "uLThptPerSliceSubnetGuaThpt" : 8.0,
            "uLThptPerUEPerSubnetGuaThpt" : 4.0,
            "$plmnInfoList":
            [
                    plmnInfoStore[slice-1]
            ],
            "$nssHasRequirement":
            [
                    "NetworkSliceSubnet:NSSI-"+str(slice)
            ],
            "dynamicAttributes": [

            ]
        }
        topology["jsonHolder"]["json"].append(function)
        
# Generating entities qosProfile         
    for qos in range(1, qoss+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/qosProfile",
            "$refId":       "qosProfile:qosProfile-"+str(qos),
            "name":         "qosProfile:qosProfile-"+str(qos),
            "comments":     comment,   
            "status":       "operating",
            "$networkSliceSubnets":
            [
                    "NetworkSliceSubnet:NSSI-"+str(((qos-1)*2)+1),
                    "NetworkSliceSubnet:NSSI-"+str(((qos-1)*2)+2)
            ]
        }
        topology["jsonHolder"]["json"].append(function)  
        
# Generating entities fiveQIFlow         
    for slice in range(1, slice+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/fiveQIFlow",
            "$refId":       "fiveQIFlow:5QIFlow-"+str(slice),
            "name":         "fiveQIFlow:5QIFlow-"+str(slice),
            "comments":     comment,   
            "status":       "operating",
            "fiveQIValue": random.randint(1,5),
            "resourceType": random.choice(["GBR"]),
            "priorityLevel": random.randint(1,5),
            "packetDelayBudget": random.randint(50,100),
            "packetErrorRate": round(random.uniform(0.1,0.5),1),
            "averagingWindow": 10,
            "maximumDataBurstVolume" : random.randint(1000,9999),
            "dscp": random.randint(1,5)
        }
        topology["jsonHolder"]["json"].append(function)
        
        
# Generating entities fiveQISet         
    for qos in range(1, qoss+1):
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/fiveQISet",
            "$refId":       "fiveQISet:5QISet-"+str(qos),
            "name":         "fiveQISet:5QISet-"+str(qos),
            "comments":     comment,   
            "status":       "operating",
            "supportedFunction": "gnbdu",
            "isDefaultSet": True,
            "$qosProfile":
            [
                    "qosProfile:qosProfile-"+str(qos)
            ],
            "$fiveQIFlows":
            [
                    "fiveQIFlow:5QIFlow-"+str(((qos-1)*2)+1),
                    "fiveQIFlow:5QIFlow-"+str(((qos-1)*2)+2)
            ],
            "$resourcePartitions":
            [
                    "resourcePartition:RP-"+str(((qos-1)*2)+1),
                    "resourcePartition:RP-"+str(((qos-1)*2)+2)
            ]
        }
        topology["jsonHolder"]["json"].append(function)
                                                                                                                              
# Generating entities gnbdu & nrCell 
    for gnbdu in range(1, gnbdus+1):
        totalSpectrumShareDL=random.randint(10,20)
        totalSpectrumShareUL=random.randint(20,30)
        dlThptCapacity=random.randint(10,20)
        ulThptCapacity=random.randint(10,20)   
        for nrCell in range(1, nrCells+1):
            cell = ((gnbdu-1) * nrCells) + nrCell
            nrCellStore = "nrCell:gNodeBRadio"+str(gnbdu)+"-"+str(cell)
            function = {
                "$type": "ctw/nrCell",
                "$action": "reconcile",
                "$refId": "nrCell:gNodeBRadio"+str(gnbdu)+"-"+str(cell),
                "name": "nrCell:gNodeBRadio"+str(gnbdu)+"-"+str(cell),
                "comments": comment,  
                "status": "operating",
                "localCellIdNci": int("120"+str(cell)),
                "trackingAreaCode": int("80"+str(gnbdu)),
                "cellResourceMappingId": str(cell),
                "$geographicSite":
                [
    
                ],
                "$plmnInfoList":
                [
                        plmnInfoStore[(gnbdu-1)*2],
                        plmnInfoStore[((gnbdu-1)*2)+1]
                        
                ],                  
                "$networkSliceSubnetForNrCell" :
                [
                        "NetworkSliceSubnet:NSSI-"+str(((gnbdu-1)*2)+1),
                        "NetworkSliceSubnet:NSSI-"+str(((gnbdu-1)*2)+2)
                ],
                "$networkSliceForNrCell" :
                [
                        "NetworkSlice:NSI-"+str(((gnbdu-1)*2)+1),
                        "NetworkSlice:NSI-"+str(((gnbdu-1)*2)+2)
                ],                 
                "dynamicAttributes":
                [
                    {
                      "groupName": "RrpParameters",
                      "attributeName": "totalSpectrumShareDL",
                      "attributeValue": totalSpectrumShareDL
                    },
                    {
                      "groupName": "RrpParameters",
                      "attributeName": "totalSpectrumShareUL",
                      "attributeValue": totalSpectrumShareUL
                    },                  
                    {
                      "groupName": "RrpParameters",
                      "attributeName": "dlThptCapacity",
                      "attributeValue": dlThptCapacity
                    },
                    {
                      "groupName": "RrpParameters",
                      "attributeName": "ulThptCapacity",
                      "attributeValue": ulThptCapacity
                    },  
                    {
                      "groupName": "ExternalRef",
                      "attributeName": "nrCellDuFDN",
                      "attributeValue": "SubNetwork=RAN,MeContext=gNodeBRadio"+str(gnbdu)+",ManagedElement=gNodeBRadio"+str(gnbdu)+",GNBDUFunction=1,NRCellDU=gNodeBRadio"+str(gnbdu)+"-"+str(cell)
                    }, 
                    {
                      "groupName": "ExternalRef",
                      "attributeName": "nrCellCuFDN",
                      "attributeValue": "SubNetwork=RAN,MeContext=gNodeBRadio"+str(gnbdu)+",ManagedElement=gNodeBRadio"+str(gnbdu)+",GNBCUCPFunction=1,NRCellCU=gNodeBRadio"+str(gnbdu)+"-"+str(cell)
                    }
                ]     
            }
            topology["jsonHolder"]["json"].append(function)
        function = {
            "$action":      "reconcile",
            "$type":        "ctw/gnbdu",
            "$refId":       "gNBDU:gNodeBRadio"+str(gnbdu),
            "name":         "gNBDU:gNodeBRadio"+str(gnbdu),
            "comments":     comment,   
            "status":       "operating",
            "$geographicSite":
            [

            ],
            "$supportingNetSliceSubnets":
            [
                    "NetworkSliceSubnet:NSSI-"+str(((gnbdu-1)*2)+1),
                    "NetworkSliceSubnet:NSSI-"+str(((gnbdu-1)*2)+2)
            ],
            "$nrCells": nrCellList(gnbdu, nrCells),
            "$fiveQISets" : 
            [
                    "fiveQISet:5QISet-"+str(gnbdu)
            ],
            "$resourcePartitionSet" :
            [
                    "resourcePartitionSet:RPS-"+str(gnbdu)
            ]
        }
        topology["jsonHolder"]["json"].append(function)    
        
    return topology

def resource_partitions(rps, rp):
    function =[]
    for item in range(1, rp+1):
        function.append("resourcePartition:RP-"+str(((rps-1) * rp)+item))
     
    return function

def nrCellList(gnbdu, nrcells):
    function =[]
    for item in range(1, nrcells+1):
        function.append("nrCell:gNodeBRadio"+str(gnbdu)+"-"+str(((gnbdu-1) * nrcells)+item))
     
    return function    

def ipv4():
    return ".".join(map(str, (random.randint(0, 255) 
                        for _ in range(4))))
    
def replace_reconcile_to_delete(topology):
    for item in topology["jsonHolder"]["json"]:
        item['$action'] = "delete"
    return topology     


def save_topology_to_json(topology, filename):
    with open(filename, "w") as file:
        json.dump(topology, file, indent=2)

if __name__ == "__main__":
    start = datetime.now()
    random_topology = generate_random_topology()
    save_topology_to_json(random_topology, filename+".json" )
    save_topology_to_json(replace_reconcile_to_delete(random_topology), filename+"_delete.json")
    entity_count = resourcePartitionSet + (resourcePartitionMember * 2) + ((mcc_max - mcc_min + 1) * (mnc_max - mnc_min + 1) * (sd_max - sd_min + 1) * (sst_max - sst_min + 1)) + (slices * 6) + (gnbdus * nrCells) + gnbdus
    print("\nTopology files generated Successfully:")
    print("      Files: ",filename+".json", filename+"_delete.json")
    print("      Entities: ", entity_count)
    print("      Time: ", datetime.now()-start)
    print()