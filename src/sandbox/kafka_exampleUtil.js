import { check, group } from 'k6';
import { Connection, Writer, Reader, SchemaRegistry, SCHEMA_TYPE_STRING } from "k6/x/kafka";

const kafkaServer = "localhost:9092"
let topic;
let writer;
let reader;
let connection;

const schemaRegistry = new SchemaRegistry();

export default function () {

    group("Verify Producing and Consuming Messages", function () {
        group("Verify Connection Setup, Writer, and Reader", function () {
            topic = "topic-test";

            connection = new Connection({ address: kafkaServer });

            writer = new Writer({ brokers: [kafkaServer], topic: topic });
            reader = new Reader({ brokers: [kafkaServer], topic: topic });
        })

        group("Verify Creating Topic", function () {
            connection.createTopic({
                topic: topic,
                numPartitions: 1,
                replicationFactor: 1,
            });
            const results = connection.listTopics();
            const createTopicResult = check(results, {
                "Check topic is created": (r) => results.includes(topic)
            });
            if (!createTopicResult)
                console.error('Topic ' + topic + ' is not created. ' + results);
        })

        group("Verify Producing Messages", function () {
            for (let i = 0; i < 2; i++) {
                writer.produce({
                    messages: [{
                        key: schemaRegistry.serialize({
                            data: "test-key" + i,
                            schemaType: SCHEMA_TYPE_STRING,
                        }),
                        value: schemaRegistry.serialize({
                            data: "test-value" + i,
                            schemaType: SCHEMA_TYPE_STRING,
                        }),
                    }]
                });
            }
        })

        group("Verify Consuming Messages", function () {
            let messages = reader.consume({
                limit: 2
            });
            console.log(messages);
            const consumedMessageResult = check(messages, {
                "Check consumed message (length = 2)": (msg) => msg.length == 2,
            });
            if (!consumedMessageResult)
                console.error('Massage is not consumed sucessfully. The length of message is ' + messages.length);
        })

        group('Verify Deleting Topic and Closing Connections', function () {
            connection.deleteTopic(topic);
            const results = connection.listTopics();
            const deleteTopicResult = check(results, {
                "Check delete topic": (msg) => msg.includes(topic) == false,
            });
            if (!deleteTopicResult)
                console.error('Topic ' + topic + ' is not deleted.' + results);

            writer.close();
            reader.close();
            connection.close();
        })

    })
}
