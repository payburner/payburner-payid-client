import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class BtcTestnet implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.CryptoAddress;
    environment = 'TESTNET';
    header = PayIDHeader.BTC_TESTNET;
    network = PayIDNetworks.BTC;
}