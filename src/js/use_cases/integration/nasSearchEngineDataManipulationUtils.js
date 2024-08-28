import http from "k6/http";
import { check, group } from "k6";

/* * Creates index in search engine
*
*   @param {url} - The url of the search engine (search engine service name and port number)
*   @param {indexEndpoint} - The endpoint to add index to search engine
*   @param {indexSpecification} - The content of index specification
*/
export function createIndexSearchEngine(url, indexEndpoint, indexSpecification) {
    let indexExist = verifySearchEngineIndexExists(url, indexEndpoint);
    if (!indexExist) {
        console.log('Creating index in search engine');

        let endpoint_url = url + indexEndpoint + '?pretty';

        const headers = { 'Content-Type': 'application/json' };
        const res = http.put(endpoint_url, JSON.stringify(indexSpecification), { headers: headers });

        if (res.status != 200)
            console.error("Create index in search engine failed, status is " + res.status);
    }
    else
        console.log('The index ' + indexEndpoint + ' already exists in search engine! skipping creating the index.');
}

/* * Adds bulk data/document to an index in search engine
*
*   @param {url} - The url of the search engine (search engine service name and port number)
*   @param {indexEndpoint} - The endpoint to add index to search engine
*   @param {documentData} - The document to be added into an index
*/
export function addBulkDataSearchEngine(url, indexEndpoint, documentData) {
    let indexExist = verifySearchEngineIndexExists(url, indexEndpoint);
    if (indexExist) {
        console.log('Adding bulk data to search engine');

        let endpoint_url = url + indexEndpoint + '/_bulk';

        const headers = { 'Content-Type': 'application/x-ndjson' };
        const res = http.put(endpoint_url, documentData, { headers: headers });

        if (res.status != 200)
            console.error("Add bulk data (document) to search engine " + indexEndpoint + " failed, status is " + res.status);
    }
    else
        console.log('There is no index for ' + indexEndpoint + ' in search engine!');
}

/* * Get index in search engine
*
*   @param {url} - The url of the search engine (search engine service name and port number)
*   @param {indexEndpoint} - The endpoint to add index to search engine
*/
export function verifySearchEngineIndexExists(url, indexEndpoint) {
    let indexExists = false;

    let endpoint_url = url + indexEndpoint + '?pretty';

    const res = http.get(endpoint_url);

    if (res.status != 200) {
        console.error("Get search engine index failed, status is " + res.status);
        indexExists = false;
    }
    else
        indexExists = true;

    return indexExists;
}