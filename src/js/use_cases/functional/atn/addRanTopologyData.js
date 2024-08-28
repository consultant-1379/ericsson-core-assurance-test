import { group } from 'k6';
import { sendATNTopologyData } from '../../../modules/atn/atnKafkaFunction.js';
import { ATN } from '../../../modules/const.js';


let filePath = '../../../modules/datasets/atn/input-create-ran-nrCell-data.json';
let rawRanKafkaInputData = JSON.parse(open(filePath));
let deleteFilePath = '../../../modules/datasets/atn/input-delete-ran-nrCell-data.json';
let rawDeleteRanKafkaInputData = JSON.parse(open(deleteFilePath));

/** addRanTopologyData
 * Add CTS RAN topology data through kafka events to ATN
 * Send a 'cts create' event notification to the 'cts change' event topic.
 * @param {kafka_url} - The url of the ADP Kafka broker service
 */
export function addRanTopologyData(kafka_url) {
  group('Send kafka events to ATN for RAN Topology', function () {
    console.log("Starting RAN topology data ingest to ATN");
    sendATNTopologyData(kafka_url, rawRanKafkaInputData);
  });
}

/** deleteRanTopologyData
 * Delete CTS RAN topology data through kafka events to ATN
 * Send a 'cts delete' event notification to the 'cts change' event topic.
 * @param {kafka_url} - The url of the ADP Kafka broker service
 */
export function deleteRanTopologyData(kafka_url) {
  group('Send delete kafka events to ATN for RAN Topology', function () {
    console.log("Starting RAN topology data delete ingest to ATN");
    sendATNTopologyData(kafka_url, rawDeleteRanKafkaInputData, ATN.eventTypeDelete);
  });
}
