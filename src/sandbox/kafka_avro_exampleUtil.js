/*
This is a k6 test script that imports the xk6-kafka and
tests Kafka by sending Avro messages per iteration
without any associated key.
*/

import { check } from "k6";
import {
  Writer,
  Reader,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_AVRO,
} from "k6/x/kafka"; // import kafka extension

const brokers = ["localhost:9092"];
const topic = "aug_avro_topic";

const writer = new Writer({
  brokers: brokers,
  topic: topic,
  autoCreateTopic: true,
});
const reader = new Reader({
  brokers: brokers,
  topic: topic,
});
const connection = new Connection({
  address: brokers[0],
});
const schemaRegistry = new SchemaRegistry();

if (__VU == 0) {
  connection.createTopic({ topic: topic });
}

const valueSchema = JSON.stringify({
    "type": "record",
    "name": "AMF_Mobility_NetworkSlice",
    "namespace": "PM_COUNTERS",
    "fields": [
      {
        "name": "ossid",
        "type": "string",
        "doc": "Unique identifier of the Element Network Manager"
      },
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
        "doc": "local DN of the sending network node"
      },
      {
        "name": "elementType",
        "type": [
          "null",
          "string"
        ],
        "default": null,
        "doc": "type of sending network node (e.g. PCC or PCG)"
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
        "name": "ropBeginTime",
        "type": "string",
        "doc": "collection begin timestamp in UTC format"
      },
      {
        "name": "ropEndTime",
        "type": "string",
        "doc": "collection end timestamp in UTC format"
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
                  "int"
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
  });

export default function () {
  for (let index = 0; index < 2; index++) {
    let messages = [
      {
        value: schemaRegistry.serialize({
          data: {
            ossid: "1",
            dnPrefix: null,
            nodeFDN: "sample",
            elementType: null,
            moFdn: "sample",
            snssai: null,
            ropBeginTime: "00:00:00",
            ropEndTime: "00:00:15",
            suspect: null,
            pmCounters: null,
          },
          schema: { schema: valueSchema },
          schemaType: SCHEMA_TYPE_AVRO,
        }),
      },
    ];
    writer.produce({ messages: messages });
  }

  // Read 2 messages only
  let messages = reader.consume({ limit: 2 });
  console.log(messages);
  let messageNodeFDN = "";
  const result = check(messages, {
    "Check 2 message returned (length = 2)": (msgs) => msgs.length == 2,
    "Check message (value)": (msgs) => {
      messageNodeFDN = schemaRegistry.deserialize({
        data: msgs[0].value,
        schema: { schema: valueSchema },
        schemaType: SCHEMA_TYPE_AVRO,
      }).nodeFDN;
      return messageNodeFDN == "sample";
    }
  });
  if (!result) {
    if (messages.length != 2)
      console.error("Read two message returned unexpected number of message. Message length is " + messages.length);

    if (messageNodeFDN != 'sample')
      console.error("Value is incorrect for read message. The value is " + messageNodeFDN);
  }
}

export function teardown(data) {
  /*if (__VU == 0) {
    // Delete the topic
    connection.deleteTopic(topic);
  }*/
  writer.close();
  reader.close();
  connection.close();
}
