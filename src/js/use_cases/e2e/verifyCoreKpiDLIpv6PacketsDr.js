import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyDLIpv6PacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyDLIpv6PacketsDr(){
  group('E2E Verification for CORE KPI DlIpv6PacketsDr', function(){
    let expectedKpiValue = 400;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.dLIpv6PacketsDrName, expectedKpiValue);
  });
}
