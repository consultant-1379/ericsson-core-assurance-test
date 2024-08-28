import http from "k6/http";
import { check, group } from "k6";

import searchEngineMockData from '../modules/datasets/nasSearchEngineMockData/searchEngineIndexSampleSpecification.js';
const documentSampleData = open('../modules/datasets/nasSearchEngineMockData/searchEngineSampleDocumentData.js', 'b');

import { createIndexSearchEngine, addBulkDataSearchEngine } from '../modules/nasSearchEngineDataManipulationUtils.js';

/* * Create Index and add document to search engine
*
*   @param {url} - The url of the search engine (search engine service name and port number)
*   @param {indexEndpoint} - The endpoint to add index or document in search engine
*/
export default function (url, indexEndpoint) {
    createIndexSearchEngine(url, indexEndpoint, searchEngineMockData.indexBodyWithMapping);
    addBulkDataSearchEngine(url, indexEndpoint, documentSampleData);
}
