import http from 'k6/http';
import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyDlUeThroughput
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyDlUeThroughput() {
  group('E2E Verification for RAN KPI DlUeThroughput', function() {
    let expectedKpiValue = 128;
    verifyKpiValueOnAISandNAS(AIS.ranAllContextId, AIS.dluethroughputName, expectedKpiValue);
  });
}
