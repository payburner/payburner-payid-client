import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
var Ach = /** @class */ (function () {
    function Ach() {
        this.addressDetailsType = AddressDetailsType.AchAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.ACH;
        this.network = PayIDNetworks.ACH;
    }
    return Ach;
}());
export { Ach };
//# sourceMappingURL=Ach.js.map