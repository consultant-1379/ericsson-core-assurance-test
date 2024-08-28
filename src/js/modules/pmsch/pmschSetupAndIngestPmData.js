import { KAFKA_SERVER_URL, PM_STATS, AAS, KFtlsConfig } from '../const.js';
import {
  Connection
} from "k6/x/kafka"; // import kafka extensions

/**
 *   setupKafkaTopic()
 *   This function is used to create kafka topic for producing or consuming data 
 *   @param {kafkaTopic} - Kafka topic for creation
 */
export function setupKafkaTopic(kafkaTopic)
{
  let newTopicFlag= false;
  const brokers = [KAFKA_SERVER_URL];
  const connection = new Connection({
    address: brokers[0],
    tls:KFtlsConfig,
  });
  const results = connection.listTopics();
  if(!results.includes(kafkaTopic))  {
    connection.createTopic({
      topic: kafkaTopic,
      numPartitions: 3,
      replicationFactor: 1,
      configEntries: [{
         configName: "min.insync.replicas",
         configValue: "1",
       }],
    });
    newTopicFlag= true;
  }
  else {
    console.log("Kafka Topic already exist");
  }
  if(newTopicFlag)  {
    const results = connection.listTopics();
    if(!results.includes(kafkaTopic)) {
      console.error("The list of kafka topics does not include newly created topic.");
    }
  }
  console.log("Closing Kafka connection");
  if (connection)
      connection.close();
}

/**  setupCoreRanKafkaTopicsForAASandPMSCH()
 *   This function is used to create input kafka topic for PMSCH and
 *   AAS to read data from. These are output topics of Core & RAN parsers.
 */
export function setupCoreRanKafkaTopicsForAASandPMSCH()
{
  // Creating Kafka Topic for sending Non Augmented Core Data
  setupKafkaTopic(PM_STATS.inTopicName);

  // Creating Kafka Topic for sending Augmented Ran Data
  setupKafkaTopic(AAS.ebsnInTopicName);
}
