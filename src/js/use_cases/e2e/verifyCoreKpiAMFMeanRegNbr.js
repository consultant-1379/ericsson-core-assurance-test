import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';

/* verifyAMFMeanRegNbr
 * Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */

export function verifyAMFMeanRegNbr(){
  group('E2E Verification for CORE KPI AMFMeanRegNbr', function(){
      let expectedKpiValue = 30;
      verifyKpiValueOnAISandNAS(AIS.coreAllContextID, AIS.amfMeanRegNbrName, expectedKpiValue);
    });
}
