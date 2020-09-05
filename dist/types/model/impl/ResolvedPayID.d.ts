import { PaymentInformation } from "../interfaces/PaymentInformation";
import { Address } from "../interfaces/Address";
import { SignedPayIDAddress } from "../interfaces/SignedPayIDAddress";
export declare class ResolvedPayID implements PaymentInformation {
    constructor(addresses: Address[], payId?: string, memo?: string, proofOfSignature?: string, verifiedAddresses?: SignedPayIDAddress[]);
    addresses: Address[];
    memo?: string;
    payId?: string;
    proofOfControlSignature?: string;
    verifiedAddresses?: SignedPayIDAddress[];
}
