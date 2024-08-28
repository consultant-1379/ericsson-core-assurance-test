import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyDLIpv4PacketsDr
 *  Verifying KPI value calculated by PMSCH on NAS and contextId on AIS
 */
export function verifyDLIpv4PacketsDr(){
  group('E2E Verification for CORE KPI DlIpv4PacketsDr', function(){
    let expectedKpiValue = 500;
    verifyKpiValueOnAISandNAS(AIS.newCoreKPIContextID, AIS.dLIpv4PacketsDrName, expectedKpiValue);
  });
}
