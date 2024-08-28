import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/* verifyDGTPTN
 * Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyDGTPTN(){
  group('E2E Verification for CORE KPI DGTPTN', function(){
      let expectedKpiValue = 1;
      verifyKpiValueOnAISandNAS(AIS.gtpPacketsContextId, AIS.dgtptnName, expectedKpiValue);
  });
}
