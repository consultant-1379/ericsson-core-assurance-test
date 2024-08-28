import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyULUnstrPacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyULUnstrPacketsDr(){
  group('E2E Verification for CORE KPI ULUnstrPacketsDr', function(){
    let expectedKpiValue = 2000;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.uLUnstrPacketsDrName, expectedKpiValue);
  });
}
