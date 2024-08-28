/*
This is a k6 test script that imports the xk6-kafka and tests Kafka by sending Avro messages per iteration without any associated key.
*/

import { check } from 'k6';
import {
  Writer,
  Reader,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_AVRO
} from 'k6/x/kafka'; // importing these xk6 individual classes and constants function modules from the kafka extension

const brokers = ['localhost:9092']; // for testing with p-f to hall147
const topic = 'aa_avro_topic';

// Creates a new Writer, Reader, Connection objects to produce messages to Kafka
const writer = new Writer({
  brokers: brokers,
  topic: topic,
  autoCreateTopic: true
});

const reader = new Reader({
  brokers: brokers,
  topic: topic
});

const connection = new Connection({
  address: brokers[0]
});

// Can accept a SchemaRegistryConfig object
const schemaRegistry = new SchemaRegistry({
  url: 'http://localhost:8081' // for testing with p-f to hall147
});

if (__VU == 0) {
  connection.createTopic({ topic: topic });
}

// Sample Avro Schema for AMF_Mobility_NetworkSlice name fields
const avroValueSchema = JSON.stringify({
  type: 'record',
  name: 'avroKeySchema_AMF_Mobility_NetworkSlice_AugmentationService',
  namespace: 'PM_COUNTERS',
  doc: 'Lets you register and write Schema Registry for Augmentation Service',
  fields: [
    {
      name: 'snssai',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'ossid',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'nodeFDN',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'elementType',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'ropBeginTime',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'ropEndTime',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'moFdn',
      type: [null, 'string'],
      default: null
    },
    {
      name: 'suspect',
      type: [null, 'boolean'],
      default: null
    },
    {
      name: 'pmCounters',
      type: [
        null,
        {
          name: 'pmCounters',
          type: 'record',
          fields: [
            {
              name: 'VS_NS_NbrRegisteredSub_5GS',
              type: [null, 'int'],
              default: null,
              doc: 'Substituted periods for underscores in PM name because periods are illegal Avro record field characters'
            }
          ]
        }
      ],
      default: null
    }
  ]
});

export default function () {
  for (let index = 0; index < 1; index++) {
    let messages = [
      {
        value: schemaRegistry.serialize({
          data: {
            snssai: null,
            ossid: '1',
            nodeFDN: 'sample',
            dnPrefix: null,
            elementType: null,
            ropBeginTime: '00:00:00',
            ropEndTime: '00:00:15',
            moFdn: 'sample',
            suspect: null,
            pmCounters: null
          },
          schema: { schema: avroValueSchema },
          schemaType: SCHEMA_TYPE_AVRO
        })
      }
    ];
    writer.produce({ messages: messages });
  }

  var messageNodeFDN = "";
  // Checking the ability to Read 1 message only
  let messages = reader.consume({ limit: 1 });
  console.log(messages);
  const readResult = check(messages, {
    'Verify 1 message returned (length)': (msgs) => msgs.length == 1,
    'Verify message (value)': (msgs) => {
      messageNodeFDN = schemaRegistry.deserialize({
        data: msgs[0].value,
        schema: { schema: avroValueSchema },
        schemaType: SCHEMA_TYPE_AVRO
      }).nodeFDN;
      return messageNodeFDN == 'sample';
    }
  });
  if (!readResult) {
    if (messages.length != 1)
      console.error("Read one message returned unexpected number of message. Message length is " + messages.length);

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