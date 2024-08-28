import { verifyCtsCreateNotification } from '../atn/verifyCtsCreateEvents.js';
import { verifyCtsUpdateNotification } from '../atn/verifyCtsUpdateEvents.js';
import { verifyCtsDeleteNotification } from '../atn/verifyCtsDeleteEvents.js';


/** atn Change Events Verification
 *  Runs ctsCreateEvents first to create a new event, then executes ctsUpdateEvent to update
 *  existing id and lastly executes the ctsDeleteEvent to delete the added event id
 *  @param {kafka_url} - The adp kafka url to be passed
 */
export function atnChangeEventsVerification(kafka_url){
    verifyCtsCreateNotification(kafka_url);
    verifyCtsUpdateNotification(kafka_url);
    verifyCtsDeleteNotification(kafka_url);
  }
