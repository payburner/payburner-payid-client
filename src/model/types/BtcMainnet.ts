import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class BtcMainnet implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.CryptoAddress;
    environment = 'MAINNET';
    header = PayIDHeader.BTC_MAINNET;
    network = PayIDNetworks.BTC;
}