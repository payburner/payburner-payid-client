import { PayIDAddressType } from "./PayIDAddressType";
import { AddressDetailsType } from "../interfaces/AddressDetailsType";
import { PayIDNetworks } from "./PayIDNetworks";
import { PayIDHeader } from "./PayIDHeader";
export declare class XrplTestnet implements PayIDAddressType {
    addressDetailsType: AddressDetailsType;
    environment: string;
    header: PayIDHeader;
    network: PayIDNetworks;
}