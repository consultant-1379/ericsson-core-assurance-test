import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js'


/** verifyDTSNSI
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyDTSNSI() {
  group('E2E Verification for CORE KPI DTSNSI', function() {
    let expectedKpiValue = 1;
    verifyKpiValueOnAISandNAS(AIS.networkSliceKpiContextId, AIS.dtsnsiName, expectedKpiValue);
  });
}
