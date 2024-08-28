/*This file contains utility functions to be used in usecases.*/

import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import http from "k6/http";
import { sleep } from "k6";
import { PROMETHEUS } from "./const.js";


/** isEmpty()
 *  This function is to validate str is not null
 *  @param {str} - Actual string
 *  @return {boolean} - It returns true or false
 */
export function isEmpty(str) {
    return (!str || 0 === str.length);
}

/** isJson()
 *  This function is to validate str is JSON formate
 *  @param {str} - Actual string
 *  @return {boolean} - It returns true or false
 */
export function isJson(str) {
    if (!isEmpty(str)) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}

/** getMetricValue()
 *  This function parses the response from prometheus endpoint
 *  and returns the metric value for a given metric name.
 *  @param {metricsResponse} - Response from prometheus metrics endpoint
 *  @param {metric} - Name of the metric
 *  @return {actual_value} - Return the original value
 */
export function getMetricValue(metricsResponse, metric, actual_value=false) {
    try {
      console.log('Executing getMetricValue function for metric ' + metric);
      const actual_metrics_list = metricsResponse.body.split('\n');
      for (const line of actual_metrics_list) {
        if (!line.includes("#") && line.includes(metric)) {
        console.log('Found metric ' + metric);
        const actual_metric_value = (!actual_value) ? parseInt(line.split(' ')[1]) : (line.split(' ')[1])
        return actual_metric_value;
        }
      }
      //return -1 if the metric is not found in the response body.
      console.error('metric key ' + metric + ' was not found.' + metricsResponse.body);
      return -1;
    }
    catch (error) {
        console.error(`Unexpected exception occured: ${error} processing the response body when getting metric value`);
    }
  }

/** getPrometheusResponse()
 *  This function returns the given metric response from prometheus endpoint.
 *  @param {url} - Micro-Service url
 *  @param {metric} - Name of the metric
 *  @return {res} - Return the response of the requested url
 */
export function getPrometheusResponse(url, metric){
    let endpoint_url = url + PROMETHEUS.endpoint;
    const url_params = new URL(endpoint_url);
    url_params.searchParams.append("includedNames", metric);
    console.log("Prometheus endpoint url is :", url_params.toString());
    const res = http.get(url_params.toString());
    (res.status === 200) ? console.log("Successful response for " + metric + " with " + res.status) :
    console.error("Unexpected status code from prometheus endpoint " + res.status + " with body " + res.body)
    return res
}

/** retryWrapper()
 *  This function is used to retry the given input function until its true.
 *  @param {retryLimit} - The retry count to be given
 *  @param {sleepInterval} - The sleep interval to run next retry
 *  @param {func} - Function to be passed
 *  @param {args} - Function arguments to be passed
 */
export function retryWrapper(retryLimit, sleepInterval, func, ...args) {
    let callingfunctionName = func.toString();
    callingfunctionName = callingfunctionName.substr('function '.length);
    callingfunctionName = callingfunctionName.substr(0, callingfunctionName.indexOf('('));
    try {
        for (let retryAttempt = 1; retryAttempt <= retryLimit; retryAttempt++) {
            const result = func(...args, retryAttempt, retryLimit);
            if (result == true) {
                console.log(callingfunctionName+" verification is successful within the given retries");
                return true;
            }
            else if (result == false && retryAttempt < retryLimit) {
                console.log(callingfunctionName+` is not successful, so retrying in ${sleepInterval} sec...`);
                sleep(sleepInterval);
            }
            else {
                console.error(callingfunctionName+` has failed with return value: `,result);
                return false;

            }
        }
        return false;
    }
    catch (error) {
        console.error(callingfunctionName+` has failed with error : ${error}`);
    }
}


/** compareArrays()
 *  This function is used to compare 2 arrays of key-value pairs with same keys.
 *  This function expects the length of both arrays are same.
 *  The keys respective values are compared from both array. 
 * Assumptions:
 *  1. This function expects the keys of {expectedArray} and {inputArray} should be in the same order.
 *  @param {expectedArray} - expected array of key-value pairs
 *  @param {inputArray} - Input array of key-value pairs to be verifed
 */
export function compareArrays(expectedArray, inputArray) {
    // Checking if arrays have the same length
    if (expectedArray.length !== inputArray.length) {
        console.error("The expected array length " + expectedArray.length
         + "and the actual array length are not same " + inputArray.length );
        console.log("Expected key value pair : " , expectedArray , "\n Input key value pair to verify : " , inputArray);
        return false
    }

    // Iterating through each key-value pair and comparing
    const comparisonResult = expectedArray.every(function(element, index) {
        if (JSON.stringify(element) === JSON.stringify(inputArray[index])){
            return true;
        }
        else {
            console.error("The expected key value pair " + JSON.stringify(expectedArray[index])
             + " doesn't match " + JSON.stringify(inputArray[index]) +
             "\n Expected key value pair : " + expectedArray + "\n Actual key value pair to verify : "
             + inputArray + "\n Look for any other key value pair mismatch from the above arrays");
        }
        return element === inputArray[index]; });
    
    // If all key-value pairs match, return true
    if (comparisonResult) {
        console.info ("The expected array matches the actual array")
    } 
    return comparisonResult;
}

/** flattenObject()
 *  This function is used to flatten a nested object into a single depth array,
 *  where each key represents the full path to the original nested value.
 *  @param {obj} - Object that needs to be flattened
 */
export function flattenObject(obj, parentKey = '') {
    let flattenedArray = [];
    for (let [key, value] of Object.entries(obj)) {
        let fullKey = parentKey ? `${parentKey}.${key}` : key;

        // Recursively flatten the nested object and add it to an array
        if (typeof value === 'object' && value !== null) {
            flattenedArray.push(...flattenObject(value, fullKey));
        } else {
            flattenedArray.push({ [fullKey]: value });
        }
    }
    return flattenedArray;
}

/** selectSubset()
 *  This function is used to select a subset of key-value pair array
 *  @param {arrayOfObjects} - Parent array of key value pair objects
 *  @param {arrayOfKeys} - input array of keys to be selected from the parent array
 *  @returns Returns a list of selected array and empty arrays if any
 */
export function selectSubset(arrayOfObjects, arrayOfKeys) {
    return arrayOfObjects.map(obj => {
        let filteredObj = {};
        arrayOfKeys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                filteredObj[key] = obj[key];
            }
        });
        return filteredObj;
    });
}

/** removeEmptyObjects()
* This function removes empty objects out of a given array of objects
* @param {arrayOfObjects} - Array of Objects with possible empty objects
* @returns Returns a new array with no empty objects
*/
export function removeEmptyObjects(arrayOfObjects){
    return arrayOfObjects.reduce((finalArray, obj) => {
        if (Object.keys(obj).length !== 0) {
            finalArray.push(obj);
        }
        return finalArray;
      }, []);
}