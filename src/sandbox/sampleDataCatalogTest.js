import http from 'k6/http';
import { check, group } from 'k6';

// Placeholder sample function for calling the function from main.js. This sample test is not to be used in the pipeline
// import getSampleDataCatalog from './use_cases/sampleDataCatalogTest.js';
// ...
//  getSampleDataCatalog(DC_URL);

// Endpoints for the different Data Catalog requests
const messageBusEndpoint = '/catalog/v1/message-bus';
const putEndpoint = '/catalog/v1/message-schema';
const getEndpoint = '/catalog/v2/message-schema';
const deleteEndpoint = '/catalog/v2/data-provider-type';

// Request body for creating a message bus in Data catalog
// A message bus must exist in the data catalog before trying to push this schema
const messageBusData = '{"name":"message-bus","clusterName":"hall147","nameSpace":"data-cat-test","accessEndpoints":["http://endpoint1:1234/"]}';

/*  Handle Data Catalog operations
*   @param {url} - The url of the micro-service
*/
export default function (URL) {
  group('Verify Data Catalog Operations', function () {
    const putEndpointUrl = URL + putEndpoint;
    const schemasEndpointUrl = URL + getEndpoint;
    const messageBusUrl = URL + messageBusEndpoint;
    let schemaId = '1';
    let dataId = '1';
    let busId = '1';

    // Message Bus is first pushed to data catalog - must exist before schema data can be pushed
    console.log(`POST Data Catalog url is: ${messageBusUrl}`);

    const mBus = http.post(messageBusUrl, messageBusData, {
      headers: { 'Content-Type': 'application/json' }
    });
    const messageBusResult = check(mBus, {
      'Check Message Bus POST (status: 201)': (r) => r.status === 201,
    });

    if (!messageBusResult)
      console.error('Message Bus POST expected status 201 but received status ' + mBus.status + ".\n Response body: " + mBus.body);

    // Message Bus id is parsed out and saved from the response body
    try {
      busId = JSON.parse(mBus.body).id;
    }
    catch (error) {
      console.error(`Unexpected exception occured: ${error} processing the response body to get message bus id`);
    }

    // Schema data that is set to use the message bus id from above (dynamic via variable)
    // Every post/put of the message bus and schema increments the ids regardless if they are the only ones so schema needs to be dynamic
    const schemaData =
    `{"dataSpace":{"name":"PUT_2G"},"dataService":{"dataServiceName":"dataservicenamePUTUpdateT"},"dataCategory":{"dataCategoryName":"CM_EXPORTS1"},"dataProviderType":{"providerVersion":"VPUT1","providerTypeId":"VPUT1"},"messageStatusTopic":{"name":"topic_put","messageBusId":${busId},"specificationReference":"specref_put_update","encoding":"JSON"},"messageDataTopic":{"name":"topic_put","messageBusId":${busId},"encoding":"JSON"},"dataServiceInstance":{"dataServiceInstanceName":"dsi_putupdate","controlEndPoint":"http://localhost:8082","consumedDataSpace":"2G","consumedDataCategory":"2G","consumedDataProvider":"2G","consumedSchemaName":"SCHPUT","consumedSchemaVersion":"2"},"dataType":{"mediumType":"stream","schemaName":"SCHPUT","schemaVersion":2,"isExternal":true,"consumedDataSpace":"4G","consumedDataCategory":"4G","consumedDataProvider":"4G","consumedSchemaName":"4G","consumedSchemaVersion":"2"},"supportedPredicateParameter":{"parameterName":"pdputupdate","isPassedToConsumedService":true},"messageSchema":{"specificationReference":"specf_update"}}`;

    // Schema is then pushed to the data catalog
    console.log(`PUT Data Catalog url is: ${putEndpointUrl}`);

    const mSchema = http.put(putEndpointUrl, schemaData, {
      headers: { 'Content-Type': 'application/json' }
    });
    const schemaPutResult = check(mSchema, {
      'Check Schema PUT (status: 201)': (r) => r.status === 201,
    });

    if (!schemaPutResult)
      console.error('Schema PUT expected status 201 but received status ' + mSchema.status + ".\n Response body: " + mSchema.body);

    // Schema id is parsed out and saved from response body
    try {
      schemaId = JSON.parse(mSchema.body).id;
    }
    catch (error) {
      console.log(`Cannot grab schema id, error: ${error} processing the response body for schema id`);
    }

    // Data Provider Type id is parsed out and saved from response body
    try {
      dataId = JSON.parse(mSchema.body).messageDataTopic.dataProviderType.id;
    }
    catch (error) {
      console.log(`Cannot grab data provider topic id, error: ${error}`);
    }

    // Reads back the schema written to the given id (or default id if schema already exists)
    const getEndpointUrl = `${URL + getEndpoint}/${schemaId}`;

    console.log(`GET Data Catalog schema url is: ${getEndpointUrl}`);

    const response = http.get(getEndpointUrl, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Get request also checks for specific metadata keys in the schema response
    // Added try-catch block for get checks to ensure deletes still happen even if metadata cannot be found
    try {
      const jsonResponse = JSON.parse(response.body);
      const schemaResponseResult = check(response, {
        'Check read schema back (status: 200)': (r) => r.status === 200,
        'Verify message data topic name (topic_put)': jsonResponse.messageDataTopic.name === 'topic_put',
        'Verify data type schema name (SCHPUT)': jsonResponse.dataType.schemaName === 'SCHPUT',
        'Verify schema spec reference (specf_update)': jsonResponse.specificationReference === 'specf_update',
      });

      if (!schemaResponseResult) {
        if (response.status != 200)
          console.error("Read schema back returned unexpected status " + response.status + ".\n Response body: " + response.body);

        if (jsonResponse.messageDataTopic.name != 'topic_put')
          console.error("Message data topic name is not topic_put . It is " + jsonResponse.messageDataTopic.name);

        if (jsonResponse.dataType.schemaName != 'SCHPUT')
          console.error("Data type schema name is not SCHPUT. It is " + jsonResponse.dataType.schemaName);

        if (jsonResponse.specificationReference != 'specf_update')
          console.error("schema spec reference is not specf_update. It is " + jsonResponse.specificationReference);
      }
    }
    catch (error) {
      console.log(`Unable to get response body, error: ${error} processing read schema response body`);
    }

    // Reads back all schemas currently in the data catalog
    console.log(`GET All Data Catalog schemas url is: ${schemasEndpointUrl}`);

    const allSchemas = http.get(schemasEndpointUrl, {
      headers: { 'Content-Type': 'application/json' }
    });

    const allSchemasResult = check(allSchemas, {
      'List all schemas (status: 200)': (r) => r.status === 200
    });

    if (!allSchemasResult)
      console.error('List all schemas returned unexpected status ' + allSchemas.status + ".\n Response body: " + allSchemas.body);

    // The following requests are used to clean up the additions added to the data catalog after a test is complete
    // This allows for multiple runs of the test (pre/post upgrade testing) and accurate checks of the data

    // Deletes the schema after the test via the Data Provider Type endpoint using parsed out id
    const dataProviderTypeUrl = `${URL + deleteEndpoint}/${dataId}`;

    console.log(`Data Provider Type URL: ${dataProviderTypeUrl}`);

    const dschema = http.del(dataProviderTypeUrl, {
      headers: { 'Content-Type': 'application/json' }
    });
    const dSchemaResult = check(dschema, {
      'verify schema DELETE (status: 204)': (r) => r.status === 204,
    });

    if (!dSchemaResult)
      console.error('Schema DELETE expected status 204 but received status ' + dschema.status + ".\n Response body: " + dschema.body);

    // Deletes the message bus after the test using parsed out id
    const deleteMessageBusUrl = `${messageBusUrl}/${busId}`;
    const dbus = http.del(deleteMessageBusUrl, {
      headers: { 'Content-Type': 'application/json' }
    });
    const dBusResult = check(dbus, {
      'Verify message bus DELETE (status: 204)': (r) => r.status === 204,
    });
    if (!dSchemaResult)
      console.error('Message bus DELETE expected status 204 but received status ' + dbus.status + ".\n Response body: " + dbus.body);
  });
}
