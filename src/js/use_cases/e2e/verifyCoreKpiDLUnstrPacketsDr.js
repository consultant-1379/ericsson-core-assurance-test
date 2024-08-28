import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyDLUnstrPacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyDLUnstrPacketsDr(){
  group('E2E Verification for CORE KPI DLUnstrPacketsDr', function(){
    let expectedKpiValue = 300;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.dLUnstrPacketsDrName, expectedKpiValue);
  });
}
