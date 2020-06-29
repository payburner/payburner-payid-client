import { CryptoAddressDetails } from "../interfaces/CryptoAddressDetails";
export declare class ResolvedCryptoAddressDetails implements CryptoAddressDetails {
    constructor(address: string, tag?: string);
    address: string;
    tag?: string;
}
