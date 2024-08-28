import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyPFCPSessEstFR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyPFCPSessEstFR(){
  group('E2E Verification for CORE KPI PFCPSessEstFR', function(){
    let expectedKpiValue = 200;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.pfcpSessEstFRName, expectedKpiValue);
  });
}
