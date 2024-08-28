import { group, sleep } from 'k6';
import { ATN } from '../../../modules/const.js';
import {
  atnSetupKafka, sendCtsEventsToTopic, verifyOutputAtnTopologyData,
  closeAtnKafkaConnections
} from '../../../modules/atn/atnKafkaFunction.js';

const associationMessageList = ["createMessage", "association"];
const objectMessageList = ["createMessage", "object"];
const valuesList = [associationMessageList, objectMessageList];

/**
 *  Verification of cts create change event
 *  Sends a 'cts create' event notification to the 'cts change' event topic and verifies it on the ATN output topic
 *  @param {kafka_url} - The url of the adp Kafka broker service
 */
export function verifyCtsCreateNotification(kafka_url) {
  group('Verify CTS Create event on ATN', function () {
    try {
      console.log("ATN: Sending Create event notification to CTS change event topic");
      atnSetupKafka(kafka_url, ATN.ctsEventTopic, ATN.topologyEventTopic);

      sendCtsEventsToTopic(ATN.eventTypeCreate, ATN.createCTSmessage);
      sleep(10);                                            // sleep to wait for the data to reach output topic

      // verify the CTS topology data consumed on topology change event topic

      verifyOutputAtnTopologyData(ATN.createEventId, valuesList, "create_notification");

    } catch (error) {
      console.error("ATN: Unexpected error while sending and consuming data for create notification", error);

    } finally {
      console.log("ATN: Closing the kafka connection for Create notification check");
      closeAtnKafkaConnections();
    }
  });
}