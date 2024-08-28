import http from 'k6/http';
import { check, group } from 'k6';
import encoding from 'k6/encoding';
import { NEO4J, ATN } from "../../../modules/const.js";
import { getMetricValue, getPrometheusResponse } from '../../../modules/utils.js';

/**
 * Verifies the ability to write entity data to Neo4j GraphDB from an Add Event.
 * @param {number} atnInitialErrorEventsTotal - The initial metric value before processing AddEvents in ATN.
 */
export default function (atnInitialErrorEventsTotal) {
  group('Verify Add Event Entity Data Write to Neo4j', function () {
    console.log('Neo4j: Querying addEvent relation data from Neo4j');
    let res;

    try {
      const endpoint_url = NEO4J.url + NEO4J.neo4jQueryEndPoint;

      const query = {
        statements: [
          {
            // Neo4j Cypher query to retrieve nrCell with plmn relation data
            statement: NEO4J.cypherAddEventQuery,
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
        'Get Neo4j addEvent data query (status: 200)': (r) => r.status === 200,
        'Check Neo4j query response body (not empty)': (r) => r.body.length > 0,
      });
      if (!result)
        console.error("Get Neo4j addEvent data query returned unexpected error with status: " +
        res.status +
        ".\n Response body: " +
        res.body);
    }
    catch (error) {
      console.error(`Unexpected response from Neo4j AddEvent query info endpoint: "${error}"`);
    }

    try {
      console.log('Response from Neo4j AddEvent data query: ' + res.body);

      const resultBodyContent = check(res, {
        // Check presence of nrCell relationship with plmn entities
        'Check presence of nrCell relationship with plmn entities (nrCell -> plmn1, nrCell -> plmn2)': (res) => {

          // Parse response body JSON
          const responseBody = JSON.parse(res.body);
          const nrCellPayLoad = JSON.parse(ATN.createNrCellWithPlmn1AndPlmn2LinkMessage.payLoad);
          const plmn1PayLoad = JSON.parse(ATN.createPlmn1Message.payLoad);
          const plmn2PayLoad = JSON.parse(ATN.createPlmn2Message.payLoad);

          let foundNrCellName = false;
          let foundPlmn1Name = false;
          let foundPlmn2Name = false;

          // Loop through data rows
          for (const row of responseBody.results[0].data) {
            const nrCellName = row.row[0].name;
            const plmn1Name = row.row[1].name;
            const plmn2Name = row.row[2].name;

            // Compare names with expected values
            if (nrCellName === nrCellPayLoad.name) {
              foundNrCellName = true;
            }
            if (plmn1Name === plmn1PayLoad.name) {
              foundPlmn1Name = true;
            }
            if (plmn2Name === plmn2PayLoad.name) {
              foundPlmn2Name = true;
            }
          }
          // Check if all expected values are found
          if (foundNrCellName && foundPlmn1Name && foundPlmn2Name) {
            return true;
          }
        }
      });
      if (!resultBodyContent) {
        console.error(
          `Unexpected response from Neo4j AddEvent query. ` +
          `Response body: ${res.body}. ` +
          `Details: nrCellName=${nrCellName}, plmn1Name=${plmn1Name}, plmn2Name=${plmn2Name}`
        );
      }
    }
    catch (error) {
      console.error(`Failed to verify Neo4j query response body for AddEvent: "${error}"`);
    }

    //Retrieve the value of the 'atn_cts_evt_processed_success_total' metric after processing the CTS AddEvents.
    let atnSucessEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[0]);
    let atnSucessEventsTotalCount = getMetricValue(atnSucessEventsTotalRes, ATN.metrics[0]);
    console.log(`ATN metric ${ATN.metrics[0]} value after AddEvents data to Neo4j: ${atnSucessEventsTotalCount}`);

    //Retrieve the value of the 'atn_cts_evt_processed_error_total' metric after processing the CTS AddEvents.
    let atnErrorEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[1]);
    let atnFinalErrorEventsTotal = getMetricValue(atnErrorEventsTotalRes, ATN.metrics[1]);
    console.log(`ATN metric ${ATN.metrics[1]} value after AddEvents data to Neo4j: ${atnFinalErrorEventsTotal}`);

    // Verify atn_cts_evt_processed_error_total should be zero after successful process
    try {
      const atnMetricCheckResult = check(atnFinalErrorEventsTotal - atnInitialErrorEventsTotal, {
        ["Check ATN metric " + ATN.metrics[1] + " after processing add events (count = 0)"]: (atnMetricDiff) => atnMetricDiff === 0
      });
        if (!atnMetricCheckResult) {
          console.error(
            `ATN metric ${ATN.metrics[1]} count for addEvent is incorrect. ` +
            `Initial Metric: ${atnInitialErrorEventsTotal}, ` +
            `Final Metric: ${atnFinalErrorEventsTotal}`
          );
        }
      } catch (error) {
        console.error(`Failed to check ATN metric after processing the add event data: "${error}"`);
      }
  });
}
