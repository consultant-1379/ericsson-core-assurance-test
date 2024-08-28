import http from 'k6/http';
import { check, group, sleep } from 'k6';

/* Verify the connection to the Schema Registry
 *   @param {url} - The url of the micro-service
*/

/* This is a placeholder sample function to call to & from Schema Registry that is required in the main.js. This sample is not intended to be executing in the k6 pipeline.
getSampleSchemaRegistry(SR_URL);
*/

const SUBJECTS_ENDPOINT = '/subjects'; //This is a name under which the schema is registered
const POST_ENDPOINT = SUBJECTS_ENDPOINT + '/additionalSchema/versions'; //When new Schema is needed to be created, a new <subject-name> is required ex: 'additionalSchema'
const GET_ENDPOINT = '/schemas/ids/1'; //Querying for a specific Schema by ID

const avroSchemaData = {
  schema:
    '{"type":"record","name":"AMF_Mobility_NetworkSlice_TEST01","Namespace":"PM_COUNTERS","fields":[{"name":"snssai","type":["null","string"],"default":null},{"name":"ossid","type":["null","string"],"default":null},{"name":"nodeFDN","type":["null","string"],"default":null},{"name":"elementType","type":["null","string"],"default":null},{"name":"ropBeginTime","type":["null","string"],"default":null},{"name":"ropEndTime","type":["null","string"],"default":null},{"name":"moFdn","type":["null","string"],"default":null},{"name":"suspect","type":["null","boolean"],"default":null},{"name":"pmCounters","type":["null",{"name":"pmCounters","type":"record","fields":[{"name":"VS_NS_NbrRegisteredSub_5GS","type":["null","int"],"default":null,"doc":"Substituted periods for underscores in PM name because periods are illegal Avro record field characters"}]}],"default":null}]}'
};

export function getSampleSchemaRegistry(URL) {
  group('Verify Connection to Schema Registry', function () {
    group('Verify Register and Write Data to Schema Registry', function () {
      //Registering Schema Registry
      let post_endpoint_url = URL + POST_ENDPOINT;
      const res = http.post(post_endpoint_url, JSON.stringify(avroSchemaData), {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('POST Schema Registry connection', 'and the url is ' + post_endpoint_url);

      var fieldName = "";
      const registryConnectionResult = check(res, {
        'Check schema registry connection (status: 200)': (r) => r.status === 200,
        'Check response (Count >= 1)': (r) => r.body.length >= 1,
        'Check request body (name)': (r) => {
          const responseSchema = JSON.parse(JSON.parse(r.request.body).schema);
          return responseSchema.fields.some((field) => {fieldName=field.name; return field.name === 'nodeFDN'; });
        }
      });
      if (!registryConnectionResult) {
        if (res.status != 200)
          console.error("Schema registry connection returned unexpected status " + res.status);

        if (res.body.length < 1)
          console.error("Count is not at least one in the schema registry connection response " + res.body);

        if (fieldName != 'nodeFDN')
          console.error("Schema registry connection response does not contain fields name key nodeFDN. Response " + res.body);
      }
    });

    group('Verify Read Schema Data from Schema Registry', function () {
      //Verifying the newly added subject published successfully
      const readSR_endpoint_url = URL + GET_ENDPOINT;
      const response = http.get(readSR_endpoint_url, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('READ Schema Registry url is ' + readSR_endpoint_url, 'with a response code: ' + response.status);

      try {
        var fieldName = "";
        const readSchemaResult = check(response, {
          'READ Schema Registry (status: 200)': (r) => r.status === 200,
          'Check response (length >= 1)': (r) => r.body.length >= 1,
          'Check response (fields name Key)': (r) => {
            const jsonArray = JSON.parse(response.body);
            const getJSONSchemaResponseObj = JSON.parse(jsonArray.schema);
            return getJSONSchemaResponseObj.fields.find((fields) => {fieldName=fields.name; return fields.name === 'nodeFDN';});
          }
        });
        if (!readSchemaResult) {
          if (response.status != 200)
            console.error("READ Schema Registry returned unexpected status " + response.status);

          if (response.body.length < 1)
            console.error("READ Schema Registry response was expected to be minimum of 1: " + response.body);

          if (fieldName != 'nodeFDN')
            console.error("READ Schema Registry response does not contain fields name key nodeFDN. Response " + response.body);
        }
      }
      catch (error) {
        console.error(`Unexpected exception occured: ${error} processing READ Schema Registry response`);
      }
    });

    group(
      'Get list of all the subject endpoints from Schema Registry',
      function () {
        //Verifying the list of all the subjects published successfully
        const listAll_endpoint_url = URL + SUBJECTS_ENDPOINT;
        const allSubjectsResponse = http.get(listAll_endpoint_url, {
          headers: { 'Content-Type': 'application/json' }
        });

        console.log(
          'List of all subject endpoints in Schema Registry url is ' + listAll_endpoint_url,
          'with a status code: ' + allSubjectsResponse.status);

        const listAllSubjectsResult = check(allSubjectsResponse, {
          'List subject endpoints in schema registry (status: 200)': (r) => r.status === 200
        });
        if (!listAllSubjectsResult)
          console.error("List subject endpoints in schema registry returned unexpected status " + allSubjectsResponse.status + '. Output list of all the registered Schemas', JSON.stringify(allSubjectsResponse, null, ' '));
      }
    );
  });
}
