import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var XrplTestnet = /** @class */ (function () {
    function XrplTestnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'TESTNET';
        this.header = PayIDHeader.XRPL_TESTNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplTestnet;
}());
export { XrplTestnet };
//# sourceMappingURL=XrplTestnet.js.map