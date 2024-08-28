import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';

/* verifyPduSesMeanNbr
 * Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
 
export function verifyPDUSesMeanNbr(){
  group('E2E Verification for CORE KPI PduSesMeanNbr', function(){
      let expectedKpiValue = 30;
      verifyKpiValueOnAISandNAS(AIS.coreAllContextID, AIS.pduSesMeanNbrName, expectedKpiValue);
  });
}
