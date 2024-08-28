import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyUGTPTN
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyUGTPTN() {
  group('E2E Verification for CORE KPI UGTPTN', function() {
    let expectedKpiValue = 1;
    verifyKpiValueOnAISandNAS(AIS.gtpPacketsContextId, AIS.ugtptnKpiName, expectedKpiValue);
  });
}
