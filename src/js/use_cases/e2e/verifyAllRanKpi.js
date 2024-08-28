import { verifyDlUeThroughput } from "./verifyRanKpiDlUeThroughput.js";
import { verify5GSEPHOSR } from "./verifyRanKpi5GSEPHOSR.js";
import { verifyDlDelay_GnbDu } from "./verifyRanKpiDLDelay_GnbDu.js";
import { verifyGRANHOSR } from "./verifyRanKpiGRANHOSR.js";
import { verifyPartialDRBAccessibility } from "./verifyRanKpiPartialDRBAccessibility.js";
import { verifyUlUeThroughput } from "./verifyRanKpiUlUeThroughput.js";
import { verifyDLLat_gNB_DU } from './verifyRanKpiDLLat_gNB_DU.js';


/* verifyAllRanKpi
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS for all RAN KPI
 */
export function verifyAllRanKpi(){
  verify5GSEPHOSR();
  verifyDlDelay_GnbDu();
  verifyDLLat_gNB_DU();
  verifyDlUeThroughput();
  verifyGRANHOSR();
  verifyPartialDRBAccessibility();
  verifyUlUeThroughput();
}
