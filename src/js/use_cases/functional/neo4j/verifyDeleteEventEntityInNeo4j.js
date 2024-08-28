import http from 'k6/http';
import { check, group } from 'k6';
import encoding from 'k6/encoding';
import { NEO4J, ATN } from "../../../modules/const.js";
import { getMetricValue, getPrometheusResponse } from '../../../modules/utils.js';

/**
 * Verifies the ability to delete entity data from Neo4j GraphDB from an Delete Event.
 * @param {number} atnInitialErrorEventsTotal - The initial metric value before processing DeleteEvents in ATN.
 */
export default function (atnInitialErrorEventsTotal) {
  group('Verify Delete from Neo4j of Entity Data ', function () {
    console.log('Neo4j: Querying deleteEvent data from Neo4j');
    let res;

    try {
      const endpoint_url = NEO4J.url + NEO4J.neo4jQueryEndPoint;

      const query = {
        statements: [
          {
            // Neo4j Cypher query to retrieve nrCell data after delete which should be empty
            statement: NEO4J.cypherDeleteEventQuery,
          },
        ],
      };

      const headers = {
        'Accept': 'application/json;charset=UTF-8',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encoding.b64encode(`${NEO4J.neo4jUser}:${NEO4J.neo4jPassword}`),
      };

      // Send HTTP POST request
      res = http.post(endpoint_url, JSON.stringify(query), { headers: headers });

      // Check response status and content.
      const result = check(res, {
        'Get Neo4j deleteEvent data query (status: 200)': (r) => r.status === 200,
        'Check Neo4j query response body (not empty)': (r) => r.body.length > 0,
      });
      if (!result)
        console.error("Get Neo4j deleteEvent data query returned unexpected error with status: " +
        res.status +
        ".\n Response body: " +
        res.body);
    }
    catch (error) {
      console.error(`Unexpected response from Neo4j DeleteEvent query info endpoint: "${error}"`);
    }

    try {
      console.log('Response from Neo4j DeleteEvent data query: ' + res.body);

      const resultBodyContent = check(res, {
        // Check presence of nrCell relationship with plmn entities
        'Check absence of nrCell after delete (nrCell)': (res) => {

          // Parse response body JSON
          const responseBody = JSON.parse(res.body);

          // Check if returned response is empty
          if (responseBody.results[0].data.length === 0) {
            return true;
          }
        }
      });
      if (!resultBodyContent) {
        console.error(
          `Unexpected response from Neo4j DeleteEvent query. ` +
          `Response body: ${res.body}. `
        );
      }
    }
    catch (error) {
      console.error(`Failed to verify Neo4j query response body for DeleteEvent: "${error}"`);
    }

    //Retrieve the value of the 'atn_cts_evt_processed_success_total' metric after processing the CTS DeleteEvents.
    let atnSucessEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[0]);
    let atnSucessEventsTotalCount = getMetricValue(atnSucessEventsTotalRes, ATN.metrics[0]);
    console.log(`ATN metric ${ATN.metrics[0]} value after DeleteEvents data to Neo4j: ${atnSucessEventsTotalCount}`);

    //Retrieve the value of the 'atn_cts_evt_processed_error_total' metric after processing the CTS DeleteEvents.
    let atnErrorEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[1]);
    let atnFinalErrorEventsTotal = getMetricValue(atnErrorEventsTotalRes, ATN.metrics[1]);
    console.log(`ATN metric ${ATN.metrics[1]} value after DeleteEvents data to Neo4j: ${atnFinalErrorEventsTotal}`);

    // Verify atn_cts_evt_processed_error_total should be zero after successful process
    try {
      const atnMetricCheckResult = check(atnFinalErrorEventsTotal - atnInitialErrorEventsTotal, {
        ["Check ATN metric " + ATN.metrics[1] + " after processing delete events (count = 0)"]: (atnMetricDiff) => atnMetricDiff === 0
      });
        if (!atnMetricCheckResult) {
          console.error(
            `ATN metric ${ATN.metrics[1]} count for deleteEvent is incorrect. ` +
            `Initial Metric: ${atnInitialErrorEventsTotal}, ` +
            `Final Metric: ${atnFinalErrorEventsTotal}`
          );
        }
      } catch (error) {
        console.error(`Failed to check ATN metric after processing the delete event data: "${error}"`);
      }
  });
}
