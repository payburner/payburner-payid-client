import {Address} from "./Address";
import {SignedPayIDAddress} from "./SignedPayIDAddress";

export interface PaymentInformation {
    addresses: Address[]
    proofOfControlSignature?: string
    payId?: string
    memo?: string,
    verifiedAddresses?: SignedPayIDAddress[]
}