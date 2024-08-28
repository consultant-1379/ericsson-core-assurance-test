import { group, sleep } from 'k6';
import { ATN } from '../../../modules/const.js';
import {
  atnSetupKafka, sendCtsEventsToTopic, verifyOutputAtnTopologyData,
  closeAtnKafkaConnections
} from '../../../modules/atn/atnKafkaFunction.js';

const associationMessageList = ["updateMessage", "association"];
const objectMessageList = ["updateMessage", "object"];
const valuesList = [associationMessageList, objectMessageList];

/**
 *  Verification of cts update change event
 *  Sends a 'cts update' event notification to the 'cts change' event topic and verifies it on the ATN output topic
 *  @param {kafka_url} - The url of the adp Kafka broker service
 */
export function verifyCtsUpdateNotification(kafka_url) {
  group('Verify CTS Update event on ATN', function () {
    try {
      console.log("ATN: Sending Update event notification to CTS change event topic");
      atnSetupKafka(kafka_url, ATN.ctsEventTopic, ATN.topologyEventTopic);

      sendCtsEventsToTopic(ATN.eventTypeUpdate, ATN.updateCTSmessage);
      sleep(10);                                            // sleep to wait for the data to reach output topic

      // verify the CTS topology data consumed on topology change event topic

      verifyOutputAtnTopologyData(ATN.updateEventId, valuesList, "update_notification");

    } catch (error) {
      console.error("ATN: Unexpected error while sending and consuming data for Update notification", error);

    } finally {
      console.log("ATN: Closing the kafka connection for Update notification check");
      closeAtnKafkaConnections();
    }
  });
}
