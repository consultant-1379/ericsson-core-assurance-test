import { group } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKpiValueOnAISandNAS } from '../../modules/pmsch/pmschAasPmDataIngest.js';


/** verifyUlUeThroughput
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyUlUeThroughput(){
  group('Verification of RAN Augmented UlUeThroughput kpi on AIS and NAS', function(){
    let expectedKpiValue = 32;
    verifyKpiValueOnAISandNAS(AIS.ranPlmnidSnssaiSchemaContextId, AIS.ulUeThroughputKpiName, expectedKpiValue);
  });
}
