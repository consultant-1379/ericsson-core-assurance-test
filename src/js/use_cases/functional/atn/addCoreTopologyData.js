import { group } from 'k6';
import { sendATNTopologyData } from '../../../modules/atn/atnKafkaFunction.js';
import { ATN } from '../../../modules/const.js';


let filePath = '../../../modules/datasets/atn/input-create-core-topology-data.json';
let rawCoreKafkaInputData = JSON.parse(open(filePath));
let deleteFilePath = '../../../modules/datasets/atn/input-delete-core-topology-data.json';
let rawCoreDeleteKafkaInputData = JSON.parse(open(deleteFilePath));

/** addCoreTopologyData
 * Add CTS Core topology data through kafka events to ATN
 * Sends a 'cts create' event notification to the 'cts change' event topic.
 * @param {kafka_url} - The url of the ADP Kafka broker service
 */
export function addCoreTopologyData(kafka_url) {
  group('Send kafka events to ATN for Core Topology', function () {
    console.log("Starting Core topology data ingest to ATN");
    sendATNTopologyData(kafka_url, rawCoreKafkaInputData);
  });
}

/** deleteCoreTopologyData
 * Delete CTS Core topology data through kafka events to ATN
 * Send a 'cts delete' event notification to the 'cts change' event topic.
 * @param {kafka_url} - The url of the ADP Kafka broker service
 */
export function deleteCoreTopologyData(kafka_url) {
  group('Send delete kafka events to ATN for Core Topology', function () {
    console.log("Starting Core topology data delete ingest to ATN");
    sendATNTopologyData(kafka_url, rawCoreDeleteKafkaInputData, ATN.eventTypeDelete);
  });
}
