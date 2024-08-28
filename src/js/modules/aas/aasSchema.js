export const srKeySchema = `{
  "name": "KeySchema",
  "type": "record",
  "fields": [
    {
      "name": "schema",
      "type": "string"
    }
  ]
}`;

export const srValueSchema = `{
  "type": "record",
  "name": "AMF_Mobility_NetworkSlice_1",
  "namespace": "AMF.Core.PM_COUNTERS",
  "fields": [
    {
      "name": "dnPrefix",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "DN prefix for the sending network node"
    },
    {
      "name": "nodeFDN",
      "type": "string",
      "doc": "Local DN of the sending network node"
    },
    {
      "name": "elementType",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "Type of sending network node (e.g. PCC or PCG)"
    },
    {
      "name": "moFdn",
      "type": "string",
      "doc": "DN of the resource being measured"
    },
    {
      "name": "snssai",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "Unique identifier of the 5G network slice"
    },
    {
      "name": "snssai_sst",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "Service/Slice Type"
    },
    {
      "name": "snssai_sd",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "Slice Differentiator"
    },
    {
      "name": "ropBeginTime",
      "type": "string",
      "doc": "Collection begin timestamp in UTC format"
    },
    {
      "name": "ropEndTime",
      "type": "string",
      "doc": "Collection end timestamp in UTC format"
    },
    {
      "name": "suspect",
      "type": [
        "null",
        "boolean"
      ],
      "default": null,
      "doc": "Reliability flag for collected data. Default is false (reliable data)."
    },
    {
      "name": "apn",
      "type": [
        "null",
        "string"
      ],
      "default": null,
      "doc": "Apn field"
    },
    {
      "name": "pmCounters",
      "type": [
        "null",
        {
          "name": "pmMetricsSchema",
          "type": "record",
          "fields": [
            {
              "name": "VS_NS_NbrRegisteredSub_5GS",
              "type": [
                "null",
                "long"
              ],
              "default": null,
              "doc": "Number of AMF subscribers"
            }
          ]
        }
      ],
      "default": null
    }
  ]
}`;