import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var BtcTestnet = /** @class */ (function () {
    function BtcTestnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'TESTNET';
        this.header = PayIDHeader.BTC_TESTNET;
        this.network = PayIDNetworks.BTC;
    }
    return BtcTestnet;
}());
export { BtcTestnet };
//# sourceMappingURL=BtcTestnet.js.map