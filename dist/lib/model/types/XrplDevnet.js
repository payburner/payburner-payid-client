import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var XrplDevnet = /** @class */ (function () {
    function XrplDevnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'DEVNET';
        this.header = PayIDHeader.XRPL_DEVNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplDevnet;
}());
export { XrplDevnet };
//# sourceMappingURL=XrplDevnet.js.map