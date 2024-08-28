import {
  Writer,
  Reader,
  Connection,
} from "k6/x/kafka"; // import kafka extensions

import { KAFKA_SERVER_URL, KFtlsConfig } from '../modules/const.js';

/** Setup new kafka connection with writer for input kafka topic and reader for output kafka topic in TLS mode
 *  @param {inputTopic} - Input topic for kafka name
 *  @param {outputTopic} - Output kafka topic name
 *  @param {kafka_url} - Kafka server url. Default value is of dmm kafka topic
 *  @param {group_ID} - Id for clubbing the messages within the kafka topic
 *  @returns Connection, Writer and Reader objects in a list
 */
export function setupKafka(inputTopic, outputTopic, kafka_url=KAFKA_SERVER_URL, group_ID="k6AAStest-group"){
    return [new Connection({ address: kafka_url, tls:KFtlsConfig }),
          new Writer({ brokers: [kafka_url], topic: inputTopic, tls:KFtlsConfig }),
          new Reader({ brokers: [kafka_url], tls:KFtlsConfig,
            groupID: group_ID,
            groupTopics: [outputTopic],
            connectLogger: false,
            heartbeatInterval: 5000000000,
            sessionTimeout: 60000000000})]
}

/** Closing kafka connections
 *  @param {connection} - Kafka connection object
 *  @param {writer} - Kafka writer object
 *  @param {reader} - Kafka reader object
 */
export function closeKafkaConnections(connection, writer, reader){
    console.log("Closing Kafka connections");
    if (connection)
        connection.close();
    if(writer)
        writer.close();
    if(reader)
        reader.close();
}
