import {PaymentInformation} from "../interfaces/PaymentInformation";
import {Address} from "../interfaces/Address";

export class ResolvedPayID implements PaymentInformation {
    constructor(addresses: Address[], payId?: string, memo?: string, proofOfSignature?: string) {
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
    }
    addresses: Address[];
    memo?: string;
    payId?: string;
    proofOfControlSignature?: string;

}