import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyPDUSessionEstSR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyPDUSessionEstSR(){
  group('E2E Verification for CORE KPI PDUSessionEstSR', function(){
    let expectedKpiValue = 150;
    verifyKpiValueOnAISandNAS(AIS.coreAllContextID, AIS.pduSessionEstSrName, expectedKpiValue);
  });
}
