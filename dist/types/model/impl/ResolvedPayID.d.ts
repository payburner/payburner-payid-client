import { PaymentInformation } from "../interfaces/PaymentInformation";
import { Address } from "../interfaces/Address";
export declare class ResolvedPayID implements PaymentInformation {
    constructor(addresses: Address[], payId?: string, memo?: string, proofOfSignature?: string);
    addresses: Address[];
    memo?: string;
    payId?: string;
    proofOfControlSignature?: string;
}
