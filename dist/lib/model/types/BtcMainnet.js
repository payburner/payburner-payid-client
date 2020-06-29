import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var BtcMainnet = /** @class */ (function () {
    function BtcMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.BTC_MAINNET;
        this.network = PayIDNetworks.BTC;
    }
    return BtcMainnet;
}());
export { BtcMainnet };
//# sourceMappingURL=BtcMainnet.js.map