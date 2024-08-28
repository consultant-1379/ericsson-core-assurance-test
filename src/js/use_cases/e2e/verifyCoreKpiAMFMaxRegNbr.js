import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/* verifyAMFMaxRegNbr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyAMFMaxRegNbr(){
  group('E2E Verification for CORE KPI AMFMaxRegNbr', function(){
    let expectedKpiValue = 30;
    verifyKpiValueOnAISandNAS(AIS.coreAllContextID, AIS.amfMaxRegNbrName, expectedKpiValue);
  });
}
