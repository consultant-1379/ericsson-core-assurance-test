import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyPFCPSessModFR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyPFCPSessModFR(){
  group('E2E Verification for CORE KPI PFCPSessModFR', function(){
    let expectedKpiValue = 200;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.pfcpSessModFRName, expectedKpiValue);
  });
}
