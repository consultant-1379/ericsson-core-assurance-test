import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyPartialDRBAccessibility
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyPartialDRBAccessibility() {
  group('E2E Verification for RAN KPI PartialDRBAccessibility', function() {
    verifyKpiValueOnAISandNAS(AIS.ranAllContextId, AIS.partialDRBAccessibilityKpiName, AIS.partialDRBAccessibilityKpiValues)
  });
}
