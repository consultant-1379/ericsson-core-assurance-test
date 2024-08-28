import { augmentationInitialRegistration } from './aasInitialRegistration.js';
import { augmentationDeregistration } from './aasDeregistrationTest.js';
import { augmentationUpdateRegistration } from './aasUpdateRegistration.js';

/** aasFunctionalFlows
 * Run initial registration, update registration
 * and de-register followed by clean up.
 */
export function aasFunctionalFlows(){
    augmentationInitialRegistration();
    augmentationUpdateRegistration();
    augmentationDeregistration();
  }