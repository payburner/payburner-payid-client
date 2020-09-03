import {Address} from "../interfaces/Address";
import {UnsignedPayIDAddress} from "../interfaces/UnsignedPayIDAddress";

export class UnsignedPayIDAddressImpl implements UnsignedPayIDAddress {
    constructor(payId: string, address: Address) {
        this.payIdAddress = address;
        this.payId = payId;
    }

    payId: string;
    payIdAddress: Address;

}