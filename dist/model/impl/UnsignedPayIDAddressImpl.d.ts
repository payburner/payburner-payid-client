import { Address } from "../interfaces/Address";
import { UnsignedPayIDAddress } from "../interfaces/UnsignedPayIDAddress";
export declare class UnsignedPayIDAddressImpl implements UnsignedPayIDAddress {
    constructor(payId: string, address: Address);
    payId: string;
    payIdAddress: Address;
}
