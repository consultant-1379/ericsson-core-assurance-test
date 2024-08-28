import { sleep } from 'k6';
import { ATN } from '../../modules/const.js';
import {
  atnSetupKafka, sendCtsEventsToTopic,
  closeAtnKafkaConnections, atnConsumeKafkaRecords
} from '../../modules/atn/atnKafkaFunction.js';
import verifyAddEventEntityInNeo4j from '../functional/neo4j/verifyAddEventEntityInNeo4j.js';
import { getMetricValue, getPrometheusResponse } from '../../modules/utils.js';

/**
 * Verification for ATN writing to Neo4j by adding entity relation data.
 * Sends multiple 'cts create' event notifications to the 'cts change' event topic
 * and verifies the data from Neo4j.
 * @param {string} kafka_url - The URL of the ADP Kafka broker service.
 */
export function verifyAtnNeo4jAddEventData(kafka_url) {
  
  //Retrieve the value of the 'atn_cts_evt_processed_success_total' metric before sending the CTS AddEvents.
  let atnSucessEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[0]);
  let atnInitialMetricVaue = getMetricValue(atnSucessEventsTotalRes, ATN.metrics[0]);
  console.log(`ATN metric ${ATN.metrics[0]} value before AddEvents: ${atnInitialMetricVaue}`);

   //Retrieve the value of the 'atn_cts_evt_processed_error_total' metric before sending the CTS AddEvents.
  let atnErrorEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[1]);
  let atnInitialErrorEventsTotal = getMetricValue(atnErrorEventsTotalRes, ATN.metrics[1]);
  console.log(`ATN metric ${ATN.metrics[1]} value before AddEvents: ${atnInitialErrorEventsTotal}`);

  try {
    console.log("ATN: Sending multiple Create event notification to CTS change event topic for neo4j Query");
    
    // Set up Kafka connection
    atnSetupKafka(kafka_url, ATN.ctsEventTopic, ATN.topologyEventTopic);
 
    // Send cts create events to topic
    sendCtsEventsToTopic(ATN.eventTypeCreate, ATN.createPlmn1Message);
    sendCtsEventsToTopic(ATN.eventTypeCreate, ATN.createPlmn2Message);
    sendCtsEventsToTopic(ATN.eventTypeCreate, ATN.createNrCellWithPlmn1AndPlmn2LinkMessage);
    sleep(10); // sleep to wait for the data to reach output topic

    atnConsumeKafkaRecords(5); // Reading messages from ATN's output kafka topic

    // Call the function to verify entity data write to Neo4j from the add event.
    verifyAddEventEntityInNeo4j(atnInitialErrorEventsTotal);

  } catch (error) {
    console.error("ATN: Unexpected Error encountered during validation of ATN writes to Neo4j", error);

  } finally {
    console.log("ATN: Closing Kafka connection after Neo4j write verification for addEvent");

    // Close Kafka connections
    closeAtnKafkaConnections();
  }
}