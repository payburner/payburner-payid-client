import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export interface PayIDAddressType {
    header: PayIDHeader;
    addressDetailsType: AddressDetailsType;
    environment: string;
    network: PayIDNetworks;
}