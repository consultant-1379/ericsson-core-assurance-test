// import { verifyPDUSessionEstSR } from "./verifyCoreKpiPDUSessionEstSR.js";
// import { verifyUGTPTN } from "./verifyCoreKpiUGTPTN.js";
// import { verifyAMFMaxRegNbr } from "./verifyCoreKpiAMFMaxRegNbr.js";
// import { verifyAMFMeanRegNbr } from "./verifyCoreKpiAMFMeanRegNbr.js";
// import { verifyUTSNSI } from "./verifyCoreKpiUTSNSI.js";
// import { verifyDGTPTN } from "./verifyCoreKpiDGTPTN.js";
// import { verifyDTSNSI } from "./verifyCoreKpiDTSNSI.js";
// import { verifyPDUSessModSR } from './verifyCoreKpiPDUSessModSR.js';
// import { verifyPDUSesMaxNbr } from "./verifyCoreKpiPduSesMaxNbr.js";
// import { verifyPDUSesMeanNbr } from "./verifyCoreKpiPduSesMeanNbr.js";
import { verifyDLIpv4PacketsDr } from './verifyCoreKpiDLIpv4PacketsDr.js';
import { verifyDLIpv6PacketsDr } from './verifyCoreKpiDLIpv6PacketsDr.js';
import { verifyDLUnstrPacketsDr } from './verifyCoreKpiDLUnstrPacketsDr.js';
import { verifyULIpv4PacketsDr } from './verifyCoreKpiULIpv4PacketsDr.js';
import { verifyULIpv6PacketsDr } from './verifyCoreKpiULIpv6PacketsDr.js';
import { verifyULUnstrPacketsDr } from './verifyCoreKpiULUnstrPacketsDr.js';
// import { verifyPFCPSessEstFR } from './verifyCoreKpiPFCPSessEstFR.js';
// import { verifyPFCPSessModFR } from './verifyCoreKpiPFCPSessModFR.js';


/* verifyAllCoreKpi
 *  Verifying KPI value calculated by PMSCH on NAS and contextId's on AIS for all Core KPI
 */
export function verifyAllCoreKpi(){
    // verifyAMFMaxRegNbr();
    // verifyAMFMeanRegNbr();
    // verifyDGTPTN();
    // verifyUGTPTN();
    // verifyDTSNSI();
    // verifyUTSNSI();
    verifyDLIpv4PacketsDr();
    verifyDLIpv6PacketsDr();
    verifyDLUnstrPacketsDr();
    verifyULIpv4PacketsDr();
    verifyULIpv6PacketsDr();
    verifyULUnstrPacketsDr();
    // verifyPFCPSessEstFR();
    // verifyPFCPSessModFR();
    // verifyPDUSessModSR();
    // verifyPDUSessionEstSR();
    // verifyPDUSesMaxNbr();
    // verifyPDUSesMeanNbr();
}
