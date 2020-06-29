import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var XrplMainnet = /** @class */ (function () {
    function XrplMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.XRPL_MAINNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplMainnet;
}());
export { XrplMainnet };
//# sourceMappingURL=XrplMainnet.js.map