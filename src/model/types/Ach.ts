import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class Ach implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.AchAddress;
    environment = 'MAINNET';
    header = PayIDHeader.ACH;
    network = PayIDNetworks.ACH;
}