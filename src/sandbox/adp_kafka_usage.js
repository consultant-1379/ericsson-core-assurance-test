import {
    Writer,
    Reader,
    Connection,
    SchemaRegistry,
    SCHEMA_TYPE_AVRO,
  } from "k6/x/kafka"; // import kafka extension
  import { check } from 'k6';

  const topic = "xk6_kafka_avro_topic";
  const brokers = ['eric-data-message-bus-kf-client:9092'];

  const writer = new Writer({
    brokers: brokers,
    topic: topic,
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
    type: "record",
    name: "Value",
    fields: [
      {
        name: "name",
        type: "string",
      },
    ],
  });

  // Import this in the main.js file of the k6 pod and run it as kafkaTest()
  // This will Produce and consume the messages with a check to make sure data is read properly
  export function kafkaTest() {
    console.log("Producing messages...")
    try {
      for (let index = 0; index < 5; index++) {
        let messages = [
          {
            value: schemaRegistry.serialize({
              data: {
                name: "xk6-kafka",
              },
              schema: { schema: valueSchema },
              schemaType: SCHEMA_TYPE_AVRO,
            }),
          },
        ];
        writer.produce({ messages: messages });
      }

      // Read 5 messages only
      console.log("Consuming messages...")
      let messages = reader.consume({ limit: 5 });
      console.log("---messages: ", messages)
      console.log("---messages.length: ", messages.length)
      check(messages, {
        "5 messages returned": (msgs) => msgs.length == 5,
        "value is correct": (msgs) =>
          schemaRegistry.deserialize({
            data: msgs[0].value,
            schema: { schema: valueSchema },
            schemaType: SCHEMA_TYPE_AVRO,
          }).name == "xk6-kafka",
      });
    } catch (error) {
      console.error("Error from kafkaTest(): ", error);
    } finally {
      console.log("Closing connection")
      if (__VU == 0) {
        // Delete the topic
        connection.deleteTopic(topic);
      }
      writer.close();
      reader.close();
      connection.close();
    }
  }