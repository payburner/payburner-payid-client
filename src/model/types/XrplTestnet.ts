import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class XrplTestnet implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.CryptoAddress;
    environment = 'TESTNET';
    header = PayIDHeader.XRPL_TESTNET;
    network = PayIDNetworks.XRPL;
}