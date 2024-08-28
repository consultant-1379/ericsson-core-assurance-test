// coreAugInfo

export const aasInfoRequest = {
  core: {
    augInfoRequest: {
      nssiField: 'nssi',
      nssiName: ['NetworkSliceSubnet:NSSI-C13', 'NetworkSliceSubnet:NSSI-C1'],
      siteField: 'site',
      siteName: 'GeographicSite:DataCenter2',
      plmnIdField: 'plmnId',
      plmnIdName: '100-101',
      aug_RequestData: {
        "inputFields": [
          {
            "name": "nodeFDN",
            "value": "MeContext=PCG00032,ManagedElement=PCC00032"
          },
          {
            "name": "snssai",
            "value": "9-3"
          }
        ],
        "augmentationFields": [
          {
            "name": "nssi"
          },
          {
            "name": "site"
          },
          {
            "name": "plmnId"
          }
        ]
      }
    },
    augRequestResponseDataForSiteAndNSSI: {
      nssiField: 'nssi',
      nssiName: ['NetworkSliceSubnet:NSSI-A1', 'NetworkSliceSubnet:NSSI-A11'],  
      siteField: 'site',
      site: 'GeographicSite:DataCenter1',
      aug_RequestData: {
          "inputFields": [
              {
                  "name": "nodeFDN",
                  "value": "MeContext=PCC00010,ManagedElement=PCC00010"
              },
              {
                  "name": "snssai",
                  "value": "1-1"
              }
          ],
          "augmentationFields": [
              {
                  "name": "nssi"
              },
              {
                  "name": "site"
              }
          ]
      }
    },
  },
  ran: {
    ranInfoRequest: {
      nssiField: 'nssi',
      nssiName: 'N8/NetworkSliceSubnet:NSSI-B1',
      tacField: 'tac',
      tacValue: '20',
      cellIdField: 'cellId',
      cellIdValue: '8220770305',
      ran_RequestData: {
        "inputFields": [
          {
            "name": "localDn",
            "value": "SubNetwork=DO5G,MeContext=TD3B297342,ManagedElement=TD3B297342"
          },
          {
            "name": "measObjLdn",
            "value": "ManagedElement=TD3B297342,GNBDUFunction=1,NRCellDU=CBC_5G_NR_1A"
          },
          {
            "name": "plmnId",
            "value": "460-08"
          },
          {
            "name": "snssai",
            "value": "2-3"
          }
        ],
        "augmentationFields": [
          {
            "name": "nssi"
          },
          {
            "name": "cellId"
          },
          {
            "name": "tac"
          }
        ],
        "queryType": "ran"
      }
    },
  },
};