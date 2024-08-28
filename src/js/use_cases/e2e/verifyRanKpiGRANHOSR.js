import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyGRANHOSR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyGRANHOSR() {
  group('E2E Verification for RAN KPI GRANHOSR', function() {
    let expectedKpiValue = 25;
    verifyKpiValueOnAISandNAS(AIS.ranPlmnidSnssaiSchemaContextId, AIS.granhosrKpiName, expectedKpiValue);
  });
}
