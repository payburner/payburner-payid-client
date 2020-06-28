import {CryptoAddressDetails} from "../interfaces/CryptoAddressDetails";

export class ResolvedCryptoAddressDetails implements CryptoAddressDetails {

    constructor(address: string, tag?:string) {
        this.address = address;
        if (typeof tag !== undefined) {
            this.tag = tag;
        }
    }

    address: string;
    tag?: string;

}