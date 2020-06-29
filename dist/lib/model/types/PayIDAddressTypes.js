import { XrplMainnet } from "./XrplMainnet";
import { XrplDevnet } from "./XrplDevnet";
import { XrplTestnet } from "./XrplTestnet";
import { Ach } from "./Ach";
import { BtcMainnet } from "./BtcMainnet";
import { BtcTestnet } from "./BtcTestnet";
import { EthMainnet } from "./EthMainnet";
var PayIDAddressTypes = /** @class */ (function () {
    function PayIDAddressTypes() {
        this.XRPL_MAINNET = new XrplMainnet();
        this.XRPL_TESTNET = new XrplTestnet();
        this.XRPL_DEVNET = new XrplDevnet();
        this.ACH = new Ach();
        this.BTC_MAINNET = new BtcMainnet();
        this.BTC_TESTNET = new BtcTestnet();
        this.ETH_MAINNET = new EthMainnet();
        this.ALL_TYPES = [
            this.XRPL_MAINNET, this.XRPL_DEVNET, this.XRPL_TESTNET, this.ACH, this.BTC_MAINNET, this.BTC_TESTNET, this.ETH_MAINNET
        ];
    }
    return PayIDAddressTypes;
}());
export { PayIDAddressTypes };
//# sourceMappingURL=PayIDAddressTypes.js.map