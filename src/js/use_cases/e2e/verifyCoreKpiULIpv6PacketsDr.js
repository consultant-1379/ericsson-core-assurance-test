import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyULIpv6PacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyULIpv6PacketsDr(){
  group('E2E Verification for CORE KPI ULIpv6PacketsDr', function(){
    let expectedKpiValue = 1500;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.uLIpv6PacketsDrName, expectedKpiValue);
  });
}
