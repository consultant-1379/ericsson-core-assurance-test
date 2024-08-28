import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyPDUSessModSR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyPDUSessModSR(){
  group('E2E Verification for CORE KPI PDUSessModSR', function(){
    let expectedKpiValue = 50;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.pduSessModSRName, expectedKpiValue);
  });
}
