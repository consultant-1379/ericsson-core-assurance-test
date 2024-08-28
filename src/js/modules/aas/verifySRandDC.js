import http from 'k6/http';
import { AAS, SR_URL } from '../const.js';

/** Verify if the required schemas and metadata are present in SR and DC.
 *
 *   @param {string} [schemaName] - The schema name to be checked in DC
 *   @param {string} [topicName] - Topic name to be verified in response from DC
 *   @param {string} [data_category] - Data category to be checked with respect to data type (DC)query
 *   @param {string} [data_provider] - Data provider to be checked with respect to data type (DC)query
 *   @param {string} [data_space] - Data space to be checked with respect to data type (DC)query
 */
export function verifySchemasInSRandDC(schemaName = AAS.schemaName, topicName = AAS.inTopicName, data_space = '5G',
    data_category = 'PM_COUNTERS', data_provider = 'CORE') {

    // Verify the schema is present in SR
    verifyAvroSchemaExists();

    // Verify the metadata is present in DC
    const DC_GET_ENDPOINT = `/catalog/v1/data-type?dataSpace=${data_space}&dataCategory=${data_category}&dataProvider=${data_provider}&schemaName=${schemaName}`;
    const dc_getByDatatypeUrl = AAS.catalogBaseUrl + DC_GET_ENDPOINT;

    const DCSchemaData = http.get(dc_getByDatatypeUrl, {
        headers: { 'Content-Type': 'application/json' }
    });

    (DCSchemaData.status === 200) ?
        console.log("DC: Returned successful response from data catalog with status " + DCSchemaData.status + ".\n Response body: " + DCSchemaData.body) :
        console.error("DC: Reading data catalog returned unexpected response " + DCSchemaData.status + ".\n Response body: " + DCSchemaData.body);

    let DcData;
    try {
        DcData = JSON.parse(DCSchemaData.body);
        if (DcData.length < 1) {
            console.error(`DC: The response was 200 successful, but the returned body ${DCSchemaData.body} is a empty list`)
        }
    }
    catch (error) {
        console.error(`DC: Cannot parse DC data for ${schemaName}, error: ${error}`);
    }

    try {
        let schema_response_name = DcData[0].schemaName;
        let topic_response_name = DcData[0].messageSchema.messageDataTopic.name;
        let result = ((schema_response_name === schemaName) && (topic_response_name === topicName));
        (result === true) ?
            console.log(`DC: Successful metadata is present in DC for schema name ${schema_response_name} and topic ${topic_response_name}`) :
            console.error(`DC: Unexpected topic ${topic_response_name} or schema name ${schema_response_name} found in data`);
    }
    catch (error) {
        console.error(`DC: Verification of schema data for ${schemaName} failed from DC, error: ${error}`);
    }
}

/** Verify if the required schema is present in SR.
 *
 *   @param {string} [subjectName] - The subject name queried to check the schemas existence in SR.
 */
export function verifyAvroSchemaExists(subjectName = AAS.subjectName)
{
   const SR_GET_VERSIONS = AAS.srSubjects + subjectName + '/versions';

   const getRes =  http.get(SR_URL+SR_GET_VERSIONS);
   if(getRes.status===200){
      console.log(`SR: Avro Schema is present for ${subjectName} in the SR with versions ${getRes.body}`)
   }
   else {
      console.error(`SR: Avro Schema existence failed for ${subjectName} with status code ${getRes.status} and body ${getRes.body}`);
   }
}
