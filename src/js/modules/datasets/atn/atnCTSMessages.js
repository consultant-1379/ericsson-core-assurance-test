export const ctsCreateEventProduceMessage = {
  "eventID": "6fd3a9c5-e571-4d46-b6c5-5bef0d6e027c",
  "eventType": "CTSCreateNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\":\"ctw/nrcell\",
    \"id\":168,
    \"href\":\"ctw/nrcell/105\",
    \"dynamicAttributes\":[{
      \"groupName\":\"RrpParameters\",
      \"attributeName\":\"ulThptCapacity\",
      \"booleanAttributeValue\":true
      }],
    \"name\":\"NR01gNodeBRadio00001-1\",
    \"comments\":\"Initialload\",
    \"createdOn\":\"2023-09-07T14:47:22.434Z\",
    \"createdBy\":\"sysadm\",
    \"status\":\"operating\",
    \"lastModifiedOn\":\"2023-09-07T14:47:22.434Z\",
    \"lastModifiedBy\":\"sysadm\",
    \"versionNumber\":1,
    \"revisionNumber\":1,
    \"administrativeState\":\"UNLOCKED\",
    \"operationalState\":\"ENABLED\",
    \"revisionGroupKey\":{
      \"type\":\"revisionGroupKey\",
      \"keyValue\":346
    },
    \"localCellIdNci\":30011,
    \"trackingAreaCode\":3010001,
    \"key\":{
    \"type\":\"ctw/nrcellKey\",
    \"keyValue\":168
    },
    \"nrFrequency\":[{
      \"mode\":\"ADDED\",
      \"value\":{
        \"type\":\"ctw/nrfrequency\",
        \"id\":165,
        \"href\":\"ctw/nrfrequency/165\",
        \"key\":{
          \"type\":\"ctw/wirelessnetworkKey\",
          \"keyValue\":165
        }
      }
    }]
  }`
};

export const ctsUpdateEventProduceMessage = {
  "eventID": "6cfd1f1e-89b8-47b6-84f7-2f86c12f922c",
  "eventType": "CTSUpdateNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\":\"ctw/nrcell\",
    \"id\":168,
    \"href\":\"ctw/nrcell/105\",
    \"dynamicAttributes\":[{
      \"groupName\":\"RrpParameters\",
      \"attributeName\":\"ulThptCapacity\",
      \"booleanAttributeValue\":true
    }],
    \"name\":\"NR01gNodeBRadio00001-1\",
    \"comments\":\"Initialload\",
    \"createdOn\":\"2023-09-07T14:47:22.434Z\",
    \"createdBy\":\"sysadm\",
    \"status\":\"operating\",
    \"lastModifiedOn\":\"2023-09-18T14:47:22.434Z\",
    \"lastModifiedBy\":\"sysadm\",
    \"versionNumber\":1,
    \"revisionNumber\":1,
    \"administrativeState\":\"UNLOCKED\",
    \"operationalState\":\"ENABLED\",
    \"revisionGroupKey\":{
      \"type\":\"revisionGroupKey\",
      \"keyValue\":346
    },
    \"localCellIdNci\":30011,
    \"trackingAreaCode\":3010001,
    \"key\":{\"type\":\"ctw/nrcellKey\",
    \"keyValue\":168},\"nrFrequency\":[{
      \"mode\":\"ADDED\",
      \"value\":{
        \"type\":\"ctw/nrfrequency\",
        \"id\":165,
        \"href\":\"ctw/nrfrequency/165\",
        \"key\":{
          \"type\":\"ctw/wirelessnetworkKey\",
          \"keyValue\":165
        }
      }
    }]
  }`
};

export const ctsDeleteEventProduceMessage = {
  "eventID": "bc4468f8-7bd1-471f-9d0b-769700217cbe",
  "eventType": "CTSDeleteNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\":\"ctw/nrcell\",
    \"id\":168,\"href\":\"ctw/nrcell/105\",
    \"dynamicAttributes\":[{
      \"groupName\":\"RrpParameters\",
      \"attributeName\":\"ulThptCapacity\",
      \"booleanAttributeValue\":true
    }],
    \"name\":\"NR01gNodeBRadio00001-1\",
    \"comments\":\"Initialload\",
    \"createdOn\":\"2023-09-07T14:47:22.434Z\",
    \"createdBy\":\"sysadm\",
    \"status\":\"operating\",
    \"lastModifiedOn\":\"2023-09-07T14:47:22.434Z\",
    \"lastModifiedBy\":\"sysadm\",
    \"versionNumber\":1,
    \"revisionNumber\":1,
    \"administrativeState\":\"UNLOCKED\",
    \"operationalState\":\"ENABLED\",
    \"revisionGroupKey\":{
      \"type\":\"revisionGroupKey\",
      \"keyValue\":346
    },
    \"localCellIdNci\":30011,
    \"trackingAreaCode\":3010001,
    \"key\":{
      \"type\":\"ctw/nrcellKey\",
      \"keyValue\":168
    },
    \"nrFrequency\":[{
      \"mode\":\"ADDED\",
      \"value\":{
        \"type\":\"ctw/nrfrequency\",
        \"id\":165,
        \"href\":\"ctw/nrfrequency/165\",
        \"key\":{
          \"type\":\"ctw/wirelessnetworkKey\",
          \"keyValue\":165
        }
      }
    }]
  }`
};

export const plmn1CreateMssage = {
  "eventID": "d2f227f4-7e6b-47ce-aa5a-857c45057315",
  "eventType": "CTSCreateNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\": \"ctw/plmninfo\",
    \"id\": 1,
    \"href\": \"ctw/plmninfo/1\",
    \"plmn_mcc\": 102,
    \"plmn_mnc\": \"103\",
    \"revisionNumber\": 1,
    \"lastModifiedOn\": \"2024-02-12T2:32:15.097Z\",
    \"lastModifiedBy\": \"sysadm\",
    \"createdOn\": \"2024-02-12T22:32:15.097Z\",
    \"createdBy\": \"sysadm\",
    \"name\": \"PlmnInfo:102-103|2-6\",
    \"comments\": \"ManualDataSet-For-ESOA1185\",
    \"status\": \"operating\",
    \"versionNumber\": 1,
    \"sNSSAI_SST\": 6,
    \"sNSSAI_SD\": \"2\",
    \"key\": {
      \"type\": \"ctw/plmninfoKey\",
      \"keyValue\": 1
    }
  }`
};

export const plmn2Createmessage = {
  "eventID": "d2f227f4-7e6b-47ce-aa5a-857c45057311",
  "eventType": "CTSCreateNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\": \"ctw/plmninfo\",
    \"id\": 2,
    \"href\": \"ctw/plmninfo/2\",
    \"plmn_mcc\": 100,
    \"plmn_mnc\": \"101\",
    \"revisionNumber\": 1,
    \"lastModifiedOn\": \"2024-02-12T2:32:15.097Z\",
    \"lastModifiedBy\": \"sysadm\",
    \"createdOn\": \"2024-02-12T22:32:15.097Z\",
    \"createdBy\": \"sysadm\",
    \"name\": \"PlmnInfo:100-101|1-5\",
    \"comments\": \"ManualDataSet-For-ESOA1185\",
    \"status\": \"operating\",
    \"versionNumber\": 1,
    \"sNSSAI_SST\": 5,
    \"sNSSAI_SD\": \"1\",
    \"key\": {
      \"type\": \"ctw/plmninfoKey\",
      \"keyValue\": 2
    }
  }`
};

export const nrCellCreateWithPlmn1AndPlmn2LinkMessage = {
  "eventID": "6fd3a9c5-e571-4d46-b6c5-5bef0d6e027c3",
  "eventType": "CTSCreateNotification",
  "eventTime": new Date().toISOString(),
  "tenant": "master",
  "payLoad": `{
    \"type\": \"ctw/nrcell\",
    \"id\": 168,
    \"href\": \"ctw/nrcell/419\",
    \"dynamicAttributes\": [{
        \"groupName\": \"RrpParameters\",
        \"attributeName\": \"ulThptCapacity\",
        \"stringAttributeValue\": \"101\"
      },
      {
        \"groupName\": \"RrpParameters\",
        \"attributeName\": \"testvalue\",
        \"integerAttributeValue\": 101
      }
    ],
    \"name\": \"NR01gNodeBRadio00001-2\",
    \"comments\": \"Initialload\",
    \"createdOn\": \"2023-09-07T14:47:22.434Z\",
    \"createdBy\": \"sysadm\",
    \"status\": \"operating\",
    \"lastModifiedOn\": \"2023-09-07T14:47:22.434Z\",
    \"lastModifiedBy\": \"sysadm\",
    \"versionNumber\": 1,
    \"revisionNumber\": 1,
    \"administrativeState\": \"UNLOCKED\",
    \"operationalState\": \"ENABLED\",
    \"revisionGroupKey\": {
      \"type\": \"revisionGroupKey\",
      \"keyValue\": 348
    },
    \"localCellIdNci\": 30011,
    \"trackingAreaCode\": 3010001,
    \"key\": {
      \"type\": \"ctw/nrcellKey\",
      \"keyValue\": 168
    },
    \"plmnInfoList\": [{
        \"mode\": \"ADDED\",
        \"value\": {
          \"type\": \"ctw/plmninfo\",
          \"id\": 1,
          \"href\": \"ctw/plmninfo/1\",
          \"key\": {
            \"type\": \"ctw/plmninfoKey\",
            \"keyValue\": 1
          }
        }
      },
      {
        \"mode\": \"ADDED\",
        \"value\": {
          \"type\": \"ctw/plmninfo\",
          \"id\": 2,
          \"href\": \"ctw/plmninfo/2\",
          \"key\": {
            \"type\": \"ctw/plmninfoKey\",
            \"keyValue\": 2
          }
        }
      }
    ]
  }`
};

export const nrCellUpdateLinkMessage = {
  "eventID": "6fd3a9c5-e571-4d46-b6c5-5bef0d6e027c2",
  "eventType": "CTSUpdateNotification",
  "eventTime": "2023-09-07T14:47:22.481Z",
  "tenant": "master",
  "payLoad": `{
    \"type\": \"ctw/nrcell\",
    \"id\": 168,
    \"href\": \"ctw/nrcell/419\",
    \"dynamicAttributes\": [{
        \"groupName\": \"RrpParameters\",
        \"attributeName\": \"ulThptCapacity\",
        \"stringAttributeValue\": \"101\"
      },
      {
        \"groupName\": \"RrpParameters\",
        \"attributeName\": \"testvalue\",
        \"integerAttributeValue\": 201
      }
    ],
    \"name\": \"NR01gNodeBRadio00001-2\",
    \"comments\": \"Initialload\",
    \"createdOn\": \"2023-09-07T14:47:22.434Z\",
    \"createdBy\": \"sysadm\",
    \"status\": \"operating\",
    \"lastModifiedOn\": \"2023-09-17T14:47:22.434Z\",
    \"lastModifiedBy\": \"sysadm\",
    \"versionNumber\": 1,
    \"revisionNumber\": 1,
    \"administrativeState\": \"UNLOCKED\",
    \"operationalState\": \"ENABLED\",
    \"revisionGroupKey\": {
      \"type\": \"revisionGroupKey\",
      \"keyValue\": 348
    },
    \"localCellIdNci\": 30011,
    \"trackingAreaCode\": 3010001,
    \"key\": {
      \"type\": \"ctw/nrcellKey\",
      \"keyValue\": 168
    },
    \"plmnInfoList\": [{
      \"mode\": \"DELETED\",
      \"value\": {
        \"type\": \"ctw/plmninfo\",
        \"id\": 1,
        \"href\": \"ctw/plmninfo/1\",
        \"key\": {
          \"type\": \"ctw/plmninfoKey\",
          \"keyValue\": 1
        }
      }
    }]
  }`
};

export const nrCellDeleteMessage = {
    "eventID": "6fd3a9c5-e571-4d46-b6c5-5bef0d6e027c1",
    "eventType": "CTSDeleteNotification",
    "eventTime": "2023-09-07T14:47:22.481Z",
    "tenant": "master",
    "payLoad": `{
      \"type\": \"ctw/nrcell\",
      \"id\": 168,
      \"href\": \"ctw/nrcell/419\",
      \"dynamicAttributes\": [{
          \"groupName\": \"RrpParameters\",
          \"attributeName\": \"ulThptCapacity\",
          \"stringAttributeValue\": \"101\"
        },
        {
          \"groupName\": \"RrpParameters\",
          \"attributeName\": \"testvalue\",
          \"integerAttributeValue\": 201
        }
      ],
      \"name\": \"NR01gNodeBRadio00001-2\",
      \"comments\": \"Initialload\",
      \"createdOn\": \"2023-09-07T14:47:22.434Z\",
      \"createdBy\": \"sysadm\",
      \"status\": \"operating\",
      \"lastModifiedOn\": \"2023-09-07T14:47:22.434Z\",
      \"lastModifiedBy\": \"sysadm\",
      \"versionNumber\": 1,
      \"revisionNumber\": 1,
      \"administrativeState\": \"UNLOCKED\",
      \"operationalState\": \"ENABLED\",
      \"revisionGroupKey\": {
        \"type\": \"revisionGroupKey\",
        \"keyValue\": 348
      },
      \"localCellIdNci\": 30011,
      \"trackingAreaCode\": 3010001,
      \"key\": {
        \"type\": \"ctw/nrcellKey\",
        \"keyValue\": 168
      },
      \"plmnInfoList\": [{
          \"mode\": \"DELETED\",
          \"value\": {
            \"type\": \"ctw/plmninfo\",
            \"id\": 2,
            \"href\": \"ctw/plmninfo/2\",
            \"key\": {
              \"type\": \"ctw/plmninfoKey\",
              \"keyValue\": 2
            }
          }
        }
      ]
    }`
  };

  export const plmn1DeleteMessage = {
    "eventID": "d2f227f4-7e6b-47ce-aa5a-857c45057316",
    "eventType": "CTSDeleteNotification",
    "eventTime": new Date().toISOString(),
    "tenant": "master",
    "payLoad": `{
      \"type\": \"ctw/plmninfo\",
      \"id\": 1,
      \"href\": \"ctw/plmninfo/1\",
      \"plmn_mcc\": 102,
      \"plmn_mnc\": \"103\",
      \"revisionNumber\": 1,
      \"lastModifiedOn\": \"2024-02-12T2:32:15.097Z\",
      \"lastModifiedBy\": \"sysadm\",
      \"createdOn\": \"2024-02-12T22:32:15.097Z\",
      \"createdBy\": \"sysadm\",
      \"name\": \"PlmnInfo:102-103|2-6\",
      \"comments\": \"ManualDataSet-For-ESOA1185\",
      \"status\": \"operating\",
      \"versionNumber\": 1,
      \"sNSSAI_SST\": 6,
      \"sNSSAI_SD\": \"2\",
      \"key\": {
        \"type\": \"ctw/plmninfoKey\",
        \"keyValue\": 1
      }
    }`
  };
  
  export const plmn2DeleteMessage = {
    "eventID": "d2f227f4-7e6b-47ce-aa5a-857c45057317",
    "eventType": "CTSDeleteNotification",
    "eventTime": new Date().toISOString(),
    "tenant": "master",
    "payLoad": `{
      \"type\": \"ctw/plmninfo\",
      \"id\": 2,
      \"href\": \"ctw/plmninfo/2\",
      \"plmn_mcc\": 100,
      \"plmn_mnc\": \"101\",
      \"revisionNumber\": 1,
      \"lastModifiedOn\": \"2024-02-12T2:32:15.097Z\",
      \"lastModifiedBy\": \"sysadm\",
      \"createdOn\": \"2024-02-12T22:32:15.097Z\",
      \"createdBy\": \"sysadm\",
      \"name\": \"PlmnInfo:100-101|1-5\",
      \"comments\": \"ManualDataSet-For-ESOA1185\",
      \"status\": \"operating\",
      \"versionNumber\": 1,
      \"sNSSAI_SST\": 5,
      \"sNSSAI_SD\": \"1\",
      \"key\": {
        \"type\": \"ctw/plmninfoKey\",
        \"keyValue\": 2
      }
    }`
  };
