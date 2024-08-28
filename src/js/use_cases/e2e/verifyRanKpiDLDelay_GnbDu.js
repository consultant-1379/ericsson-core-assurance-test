import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyDlDelay_GnbDu
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyDlDelay_GnbDu() {
  group('E2E Verification for RAN KPI DLDelayGnbDu', function() {
    let expectedKpiValue = 2;
    verifyKpiValueOnAISandNAS(AIS.ranAllContextId, AIS.dldelaygnbduKpiName, expectedKpiValue);
  });
}
