import http from 'k6/http';
import { check, group } from 'k6';
import encoding from 'k6/encoding';
import { NEO4J, ATN } from "../../../modules/const.js";
import { getMetricValue, getPrometheusResponse } from '../../../modules/utils.js';

/**
 * Verifies the ability to write entity data to Neo4j GraphDB from an Update Event.
 * @param {number} atnInitialErrorEventsTotal - The initial metric value before processing UpdateEvents in ATN.
 */
export default function (atnInitialErrorEventsTotal) {
  group('Verify Update Event Entity Data Write to Neo4j', function () {
    console.log('Neo4j: Querying Update Event relation data from Neo4j');
    let res;

    try {
      const endpoint_url = NEO4J.url + NEO4J.neo4jQueryEndPoint;

      const query = {
        statements: [
          {
            // Neo4j Cypher query to retrieve nrCell with plmn relation data
            statement: NEO4J.cypherUpdateEventQuery,
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
        'Get Neo4j updateEvent data query (status: 200)': (r) => r.status === 200,
        'Check Neo4j query response body (not empty)': (r) => r.body.length > 0,
      });
      if (!result)
        console.error("Get Neo4j updateEvent data query returned unexpected error with status: " +
        res.status +
        ".\n Response body: " +
        res.body);
    }
    catch (error) {
      console.error(`Unexpected response from Neo4j updateEvent query info endpoint: "${error}"`);
    }

    try {
      console.log('Response from Neo4j Update Event data query: ' + res.body);

      const resultBodyContent = check(res, {
        // Check presence of nrCell relationship with plmn entity 2 only
        // & RrpParameters_testvalue updated from 101 to 201
        'Check presence of nrCell relationship with plmn entity 2 & updated attribute RrpParameters_testvalue(nrCell -> plmn2 & RrpParameters_testvalue)': (res) => {

          // Parse response body JSON
          const responseBody = JSON.parse(res.body);
          const nrCellPayLoad = JSON.parse(ATN.updateNrCellMessage.payLoad);
          const plmn2PayLoad = JSON.parse(ATN.createPlmn2Message.payLoad);

          let foundNrCellName = false;
          let foundAttributetestvalue = false;
          let foundPlmn2Name = false;

          // Loop through data rows
          for (const row of responseBody.results[0].data) {
            const testvalueAttributeValue = row.row[0].RrpParameters_testvalue;
            const nrCellName = row.row[0].name;
            const plmn2Name = row.row[1].name;

            // Compare names with expected values
            if (nrCellName === nrCellPayLoad.name) {
              foundNrCellName = true;
            }
            if (testvalueAttributeValue === nrCellPayLoad.dynamicAttributes[1].integerAttributeValue) {
              foundAttributetestvalue = true;
            }
            if (plmn2Name === plmn2PayLoad.name) {
              foundPlmn2Name = true;
            }
          }
          // Check if all expected values are found
          if (foundNrCellName && foundPlmn2Name) {
            return true;
          }
        }
      });
      if (!resultBodyContent) {
        console.error(
          `Unexpected response from Neo4j UpdateEvent query. ` +
          `Response body: ${res.body}. ` +
          `Details: nrCellName=${nrCellName}, plmn2Name=${plmn2Name}`
        );
      }
    }
    catch (error) {
      console.error(`Failed to verify Neo4j query response body for Update Event: "${error}"`);
    }

    //Retrieve the value of the 'atn_cts_evt_processed_success_total' metric after processing the CTS UpdateEvent.
    let atnSucessEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[0]);
    let atnSucessEventsTotalCount = getMetricValue(atnSucessEventsTotalRes, ATN.metrics[0]);
    console.log(`ATN metric ${ATN.metrics[0]} value after UpdateEvents data to Neo4j: ${atnSucessEventsTotalCount}`);

    //Retrieve the value of the 'atn_cts_evt_processed_error_total' metric after processing the CTS UpdateEvent.
    let atnErrorEventsTotalRes = getPrometheusResponse(ATN.url, ATN.metrics[1]);
    let atnFinalErrorEventsTotal = getMetricValue(atnErrorEventsTotalRes, ATN.metrics[1]);
    console.log(`ATN metric ${ATN.metrics[1]} value after UpdateEvents data to Neo4j: ${atnFinalErrorEventsTotal}`);

    // Verify atn_cts_evt_processed_error_total should be zero after successful process
    try {
      const atnMetricCheckResult = check(atnFinalErrorEventsTotal - atnInitialErrorEventsTotal, {
        ["Check ATN metric " + ATN.metrics[1] + " after processing update events (count = 0)"]: (atnMetricDiff) => atnMetricDiff === 0
      });
        if (!atnMetricCheckResult) {
          console.error(
            `ATN metric ${ATN.metrics[1]} count for updateEvent is incorrect. ` +
            `Initial Metric: ${atnInitialErrorEventsTotal}, ` +
            `Final Metric: ${atnFinalErrorEventsTotal}`
          );
        }
      } catch (error) {
        console.error(`Failed to check ATN metric after processing the update event data: "${error}"`);
      }
  });
}
