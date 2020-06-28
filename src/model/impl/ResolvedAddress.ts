import {Address} from "../interfaces/Address";
import {CryptoAddressDetails} from "../interfaces/CryptoAddressDetails";
import {AchAddressDetails} from "../interfaces/AchAddressDetails";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";

export class ResolvedAddress implements Address {

    constructor(addressDetails: CryptoAddressDetails | AchAddressDetails, addressDetailsType: AddressDetailsType, network: string, environment?: string) {
        this.addressDetails = addressDetails;
        if (typeof environment !== undefined) {
            this.environment = environment;
        }
        this.paymentNetwork = network;
        this.addressDetailsType = addressDetailsType;
    }
    addressDetailsType: AddressDetailsType;
    addressDetails: CryptoAddressDetails | AchAddressDetails;
    environment?: string;
    paymentNetwork: string;

}