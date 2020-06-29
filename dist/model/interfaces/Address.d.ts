import { AddressDetailsType } from "./AddressDetailsType";
import { CryptoAddressDetails } from "./CryptoAddressDetails";
import { AchAddressDetails } from "./AchAddressDetails";
export interface Address {
    paymentNetwork: string;
    environment?: string;
    addressDetailsType: AddressDetailsType;
    addressDetails: CryptoAddressDetails | AchAddressDetails;
}
