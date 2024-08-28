import { group, sleep } from 'k6';
import { ATN } from '../../../modules/const.js';
import {
  atnSetupKafka, sendCtsEventsToTopic, verifyOutputAtnTopologyData,
  closeAtnKafkaConnections
} from '../../../modules/atn/atnKafkaFunction.js';

const valuesList = [null, null];

/**
 *  Verification of cts delete change event
 *  Sends a 'cts delete' event notification to the 'cts change' event topic and verifies on the ATN output topic
 *  @param {kafka_url} - The url of the adp Kafka broker service
 */
export function verifyCtsDeleteNotification(kafka_url) {
  group('Verify CTS Delete event on ATN', function () {
    try {
      console.log("ATN: Sending Delete event notification to CTS change event topic");
      atnSetupKafka(kafka_url, ATN.ctsEventTopic, ATN.topologyEventTopic);

      sendCtsEventsToTopic(ATN.eventTypeDelete, ATN.deleteCTSmessage);
      sleep(10);                                            // sleep to wait for the data to reach output topic

      // verify the CTS topology data consumed on topology change event topic

      verifyOutputAtnTopologyData(ATN.deleteEventId, valuesList, "delete_notification");

    }
    catch (error) {
      console.error("ATN: Unexpected error while sending and consuming data for Delete notification", error);
    }
    finally {
      console.log("ATN: Closing the kafka connection for Delete notification check");
      closeAtnKafkaConnections();
    }
  });
}
