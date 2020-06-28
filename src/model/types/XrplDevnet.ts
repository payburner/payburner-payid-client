import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class XrplDevnet implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.CryptoAddress;
    environment = 'DEVNET';
    header = PayIDHeader.XRPL_DEVNET;
    network = PayIDNetworks.XRPL;

}