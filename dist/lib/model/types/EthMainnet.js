import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var EthMainnet = /** @class */ (function () {
    function EthMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.ETH_MAINNET;
        this.network = PayIDNetworks.ETH;
    }
    return EthMainnet;
}());
export { EthMainnet };
//# sourceMappingURL=EthMainnet.js.map