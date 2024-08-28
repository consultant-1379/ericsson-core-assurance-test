import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyUlIpv4PacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyULIpv4PacketsDr(){
  group('E2E Verification for CORE KPI UlIpv4PacketsDr', function(){
    let expectedKpiValue = 1000;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.uLIpv4PacketsDrName, expectedKpiValue);
  });
}
