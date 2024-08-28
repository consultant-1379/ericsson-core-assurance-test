import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';

/* verifyPduSesMaxNbr
 * Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyPDUSesMaxNbr(){
  group('E2E Verification for CORE KPI PduSesMaxNbr', function(){
      let expectedKpiValue = 30;
      verifyKpiValueOnAISandNAS(AIS.coreAllContextID, AIS.pduSesMaxNbrName, expectedKpiValue);
  });
}
