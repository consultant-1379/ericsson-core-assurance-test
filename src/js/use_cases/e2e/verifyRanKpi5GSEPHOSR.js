import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verify5GSEPHOSR
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verify5GSEPHOSR() {
  group('E2E Verification for RAN KPI 5GSEPHOSR', function() {
    let expectedKpiValue = 2.5;
    verifyKpiValueOnAISandNAS(AIS.ranPlmnidSnssaiSchemaContextId, AIS.gsephosrKpiName, expectedKpiValue);
  });
}
