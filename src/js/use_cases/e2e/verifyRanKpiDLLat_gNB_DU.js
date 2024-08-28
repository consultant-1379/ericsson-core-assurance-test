import { group,check } from 'k6';
import { AIS } from '../../modules/const.js';
import { verifyKPISearchSuccess } from '../../modules/nas/nasDataVerificationFunctions.js';
import { getIndexerContextValue } from '../../modules/ais/aisKpiDataVerification.js';
import { calcBeginTimestamp, calcEndTimestamp } from '../../modules/pmsch/pmschAasPmDataIngest.js'


/** verifyDLLat_gNB_DU
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS
 */
export function verifyDLLat_gNB_DU(){
  group('E2E Verification for RAN KPI DLLat_gNB_DU', function(){
    let expectedKpiValueList= AIS.dlgnbduKpiValues;
    const contextIds = AIS.ranAllContextId;
    const kpiName = AIS.dlgnbduKpiName;
    try{
      for (let i=0; i < expectedKpiValueList.length; i++) {
        // Verifying the ValuesForFullContext response of a SearchEngine Index
        let augRanContextValue = getIndexerContextValue(AIS.oobIndexName, kpiName, contextIds[i]);
        const contextFound = check(augRanContextValue, {
          "Context ID found in AIS ": (r) => r != undefined
        })
        if(contextFound)
        {
          verifyKPISearchSuccess(AIS.oobIndexName, contextIds[i], augRanContextValue, expectedKpiValueList[i], calcBeginTimestamp, calcEndTimestamp);
        }
        else {
          console.error(`contextId: ${contextIds[i]} does not exist in AIS for kpiName: ${kpiName}`);
          continue;
        }
      }
    }
    catch (error) {
      console.error(`Verification of Kpi Data on AIS failed with unexpected error: ${error} for kpiName: ${kpiName}`);
    }
  });
}
