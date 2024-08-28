import { SchemaRegistry, SCHEMA_TYPE_STRING, SCHEMA_TYPE_JSON } from "k6/x/kafka"; // import kafka extensions
import { check, group } from 'k6';
import { closeKafkaConnections } from '../kafka_utils.js'
import { KAFKA_SERVER_URL, ATNKFtlsConfig, ATN } from '../const.js';

const schemaRegistry = new SchemaRegistry();
let atnConnection, atnWriter, atnReader;

import {
  Writer,
  Reader,
  Connection,
} from "k6/x/kafka"; // import kafka extensions

/** setupKafka
 * Kafka setup for ATN to read/write records from/to esoa-platform-message-bus
 * @param {inputTopic}  - Topic for producing records
 * @param {outputTopic} - Topic for consuming output records
 * @param {kafka_url} - Kafka Service URL
 * @param {group_ID} - Kafka consumer group
 * @returns Connection Writer & Reader objects
 */
export function setupKafka(inputTopic, outputTopic, kafka_url=KAFKA_SERVER_URL, group_ID="k6AAStest-group"){
    return [new Connection({ address: kafka_url, tls:ATNKFtlsConfig }),
          new Writer({ brokers: [kafka_url], topic: inputTopic, tls:ATNKFtlsConfig }),
          new Reader({ brokers: [kafka_url], tls:ATNKFtlsConfig,
            groupID: group_ID,
            groupTopics: [outputTopic],
            connectLogger: true,
            })]
}

/** Setting up the kafka connections for ATN
 *
 * @param {kafka_url} - The kafka url to be passed
 * @param {inputTopic} - The input topic name
 * @param {outputTopic} - The output topic name
 */
export function atnSetupKafka(kafka_url, inputTopic, outputTopic) {
  [atnConnection, atnWriter, atnReader] = setupKafka(inputTopic, outputTopic, kafka_url, "k6ATNtest-group")
}

/** Setup the kafka and create input topic to send CTS events
 *
 * @param {kafka_url} - The kafka url to be passed
 * @param {inputTopic} - The input topic name
 * @param {outputTopic} - The output topic name
 */
export function atnCtsEventCreateTopicAndVerify(kafka_url, inputTopic, outputTopic) {
  atnSetupKafka(kafka_url, inputTopic, outputTopic);
  console.log("ATN Setup: Create Topic to read CTS event change notifications");
  atnConnection.createTopic({ topic: inputTopic });
  const results = atnConnection.listTopics();
  results.includes(inputTopic) ? console.log("Topic " + inputTopic + " is created successfully") :
    console.error("Topic " + inputTopic + " is not created. " + results);
  closeAtnKafkaConnections();
}

/** Send event messages to the CTS change event topic
 *
 * @param {eventType}     The value to be passed in key field
 * @param {eventMessage}  The value(message) to be passed with respect to key
 */
export function sendCtsEventsToTopic(eventType, eventMessage) {
  let message = [
    {
      key: schemaRegistry.serialize({
        data: eventType,
        schemaType: SCHEMA_TYPE_STRING,
      }),
      value: schemaRegistry.serialize({
        data: eventMessage,
        schemaType: SCHEMA_TYPE_JSON,
      }),
    }
  ]
  atnWriter.produce({ messages: message });
  console.log("ATN: Successfully sent " + eventType + " message on cts change event topic");
}

/** Verify messages on topology change event topic of ATN
 *
 * @param {event_Id} - The event ID to be checked
 * @param {valuesCheckList} - List of sub list of both association and object attributes values to be checked
 * @param {eventNotification} - Type of event notification being checked, so used to differenciate between different notifications loggings
 */
export function verifyOutputAtnTopologyData(event_Id, valuesCheckList, eventNotification) {
  try {
    let messages = atnReader.consume({ limit: 2 });
    const consumedMessages = check(messages, {
      ["Check successfully consumed messages by ATN output topic for " + eventNotification + " (length == 2)"]:
        (msg) => msg.length == 2,
    });

    if (!consumedMessages) {
      console.error("ATN: Returned unexpected number of messages from ATN output topic for " + eventNotification + ". Message length is " + messages.length);
    }
    if (eventNotification === "delete_notification") {
      for (let x = 0; x < valuesCheckList.length; x++) {
        let kafkadata = schemaRegistry.deserialize({
          data: messages[x].value,
          schemaType: SCHEMA_TYPE_STRING,
        });
        check(kafkadata, {
          [`Check null(Tombstone record) message should be displayed for Delete event notification`]:
            (verify) => verify === null,
        });
      }
    }
    else {
      for (let x = 0; x < valuesCheckList.length; x++) {
        let flag = false;
        let values = valuesCheckList[x];
        for (let i = 0; i < messages.length; i++) {
          let kafkadata = schemaRegistry.deserialize({
            data: messages[i].value,
            schemaType: SCHEMA_TYPE_JSON,
          });
          let verifyData = (kafkadata.eventId == event_Id && kafkadata.eventType == values[0] && kafkadata.messageType == values[1]);
          if (verifyData) {
            flag = true;
            console.log("ATN: Successful ATN output topology " + values[1] + " message verified for " + eventNotification + " is " + JSON.stringify(kafkadata));
            break;
          }
        }
        let checkData = check(flag, {
          [`Check mandatory attribute values are present in ATN output topic for ${values[1]} message of ${eventNotification} (eventId, eventType, messageType)`]:
            (verify) => verify === true,
        });
        if (!checkData) {
          console.error("ATN: Object or Association Message are not consumed successfully for " + eventNotification)
        }
      }
    }
  }
  catch (error) {
    console.error("ATN: Verifying message in output ATN topic resulted with unexpected error for " + eventNotification + " with error: " + error);
  }
}

/**
 * Delete the created input topic and close the kafka connections
 *
 * @param {kafka_url}    The kafka url to be passed
 * @param {inputTopic}   The input topic name
 * @param {outputTopic}  The output topic name
 */
export function verifyDeleteTopicAndClosingConnection(kafka_url, inputTopic, outputTopic) {
  atnSetupKafka(kafka_url, inputTopic, outputTopic)
  console.log("ATN Teardown: Deleting the created " + inputTopic + " topic and close kafka connections")
  atnConnection.deleteTopic(inputTopic);
  const results = atnConnection.listTopics();
  results.includes(inputTopic) ? console.error("Topic " + inputTopic + " is not deleted. " + results) :
    console.log("Topic " + inputTopic + " is deleted successfully");
  closeAtnKafkaConnections();
}

/**
 * Closing ATN kafka connections
 */
export function closeAtnKafkaConnections() {
  closeKafkaConnections(atnConnection, atnWriter, atnReader);
}

/**
 * sendATNTopologyData
 * Sends kafka messages for Core/RAN data for ATN to consume
 * @param {kafka_url} - The url of the Kafka broker service
 * @param {rawKafkaInputData} - Raw kafka Data read from json file
 * @param {eventType} - Type of the event
 */
export function sendATNTopologyData(kafka_url, rawKafkaInputData, eventType=ATN.eventTypeCreate) {
  let sendDataSuccess= false;
  group("Send Topology data to ATN", function(){
    try {
      atnSetupKafka(kafka_url, ATN.ctsEventTopic, ATN.topologyEventTopic);
      console.log("ATN: Sending Create event notification to ATN input topic");
      rawKafkaInputData.forEach(function(record) {
        sendCtsEventsToTopic(eventType, record);
      });
      sendDataSuccess = true;
    }
    catch (error) {
      console.error("ATN: Error sending topology data to ATN", error);
    }
    finally {
      check(sendDataSuccess, {
        "Check data send to ATN consumer": (sendDataSuccess) => sendDataSuccess == true
      });
      console.log("ATN: Closing the kafka connection for data consumed by ATN");
    }
  });
}

/** Consumes messages from ATN's output Kafka topic.
 *
 * @param {consumeMessageCount} - The number of messages to be consumed from ATN's output kafka topic
 */
export function atnConsumeKafkaRecords(consumeMessageCount) {
  atnReader.consume({ limit: consumeMessageCount });
  console.log(`${consumeMessageCount}` + ` messages are successfully read from ATN's output kafka topic!` )
}
