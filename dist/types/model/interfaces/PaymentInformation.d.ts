import { Address } from "./Address";
export interface PaymentInformation {
    addresses: Address[];
    proofOfControlSignature?: string;
    payId?: string;
    memo?: string;
}
