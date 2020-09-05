import {PaymentInformation} from "../interfaces/PaymentInformation";
import {Address} from "../interfaces/Address";
import {SignedPayIDAddress} from "../interfaces/SignedPayIDAddress";

export class ResolvedPayID implements PaymentInformation {
    constructor(addresses: Address[], payId?: string, memo?: string, proofOfSignature?: string, verifiedAddresses?: SignedPayIDAddress[]) {
        this.addresses = addresses;
        if (typeof payId !== 'undefined') {
            this.payId = payId;
        }
        if (typeof memo !== 'undefined') {
            this.memo = memo;
        }
        if (typeof proofOfSignature !== 'undefined') {
            this.proofOfControlSignature = proofOfSignature;
        }
        if (typeof verifiedAddresses !== 'undefined') {
            this.verifiedAddresses = verifiedAddresses;
        }
    }
    addresses: Address[];
    memo?: string;
    payId?: string;
    proofOfControlSignature?: string;
    verifiedAddresses?:SignedPayIDAddress[];

}