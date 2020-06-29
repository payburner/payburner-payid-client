import { Address } from "../interfaces/Address";
import { CryptoAddressDetails } from "../interfaces/CryptoAddressDetails";
import { AchAddressDetails } from "../interfaces/AchAddressDetails";
import { AddressDetailsType } from "../interfaces/AddressDetailsType";
export declare class ResolvedAddress implements Address {
    constructor(addressDetails: CryptoAddressDetails | AchAddressDetails, addressDetailsType: AddressDetailsType, network: string, environment?: string);
    addressDetailsType: AddressDetailsType;
    addressDetails: CryptoAddressDetails | AchAddressDetails;
    environment?: string;
    paymentNetwork: string;
}
