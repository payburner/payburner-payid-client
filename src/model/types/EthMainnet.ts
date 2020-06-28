import {PayIDAddressType} from "./PayIDAddressType";
import {AddressDetailsType} from "../interfaces/AddressDetailsType";
import {PayIDNetworks} from "./PayIDNetworks";
import {PayIDHeader} from "./PayIDHeader";

export class EthMainnet implements PayIDAddressType {
    addressDetailsType = AddressDetailsType.CryptoAddress;
    environment = 'MAINNET';
    header = PayIDHeader.ETH_MAINNET;
    network = PayIDNetworks.ETH;
}