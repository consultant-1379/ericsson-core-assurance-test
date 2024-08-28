export const registerData = `{
    "ardqId": "aecardq",
    "ardqUrl": "https://eric-oss-core-reporting-dimension-query:8443",
    "rules": [
      {
        "inputSchema": "5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
        "fields": [
          {
            "output": "nsi",
            "input": [
              "snssai",
              "nodeFDN"
            ]
          }
        ]
      }
    ]
}`;

export const updateData = `{
    "ardqId":"aecardq",
    "ardqUrl":"https://eric-oss-core-reporting-dimension-query:8443",
    "rules":[
       {
          "inputSchema":"5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
          "fields":[
             {
                "output":"plmnId",
                "input":[
                   "snssai",
                   "nodeFDN"
                ]
             }
          ]
       }
    ]
}`;
export const deregisterData = `{
    "ardqId":"aecardq1",
    "ardqUrl":"https://eric-oss-core-reporting-dimension-query:8443",
    "rules":[
      {
        "inputSchema":"5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
        "fields":[
          {
            "output":"nsi",
            "input":[
              "snssai",
              "nodeFDN"
              ]
          }
          ]
      }
    ]
}`;
export const verifyList = `[
    {
        "ardqId": "cardq101",
        "ardqUrl": "https://eric-oss-core-reporting-dimension-query:8443",
        "rules": [
            {
                "inputSchema": "5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
                "fields": [
                    {
                        "output": "ag131",
                        "input": [
                            "snssai",
                            "nodeFDN" ]
                    }
                ]
            }
        ]
    },
    {
        "ardqId": "cardq202",
        "ardqUrl": "https://eric-oss-core-reporting-dimension-query:8443",
        "rules": [
            {
                "inputSchema": "5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
                "fields": [
                    {
                        "output": "ag231",
                        "input": [
                            "snssai",
                            "nodeFDN" ]
                    }
                ]
            }
        ]
    },
    {
        "ardqId": "cardq303",
        "ardqUrl": "https://eric-oss-core-reporting-dimension-query:8443",
        "rules": [
            {
                "inputSchema": "5G|PM_COUNTERS|AMF_Mobility_NetworkSlice_1",
                "fields": [
                    {
                        "output": "ag331",
                        "input": [
                            "snssai",
                            "nodeFDN" ]
                    }
                ]
            }
        ]
    }
]`;
