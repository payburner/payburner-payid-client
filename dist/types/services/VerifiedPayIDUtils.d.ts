import * as jose from 'node-jose';
import { UnsignedPayIDAddress } from "../model/interfaces/UnsignedPayIDAddress";
import { SignedPayIDAddress } from "../model/interfaces/SignedPayIDAddress";
import { PaymentInformation } from "../model/interfaces/PaymentInformation";
import { Address } from "../model/interfaces/Address";
import { VerificationResult } from "../model/impl/VerificationResult";
export declare class VerifiedPayIDUtils {
    newKeyStore(): jose.JWK.KeyStore;
    newKey(): Promise<jose.JWK.Key>;
    fromPEM(pem: string): Promise<jose.JWK.Key>;
    signPayID(key: jose.JWK.Key, input: PaymentInformation): Promise<PaymentInformation>;
    matchAddress(address: Address, payloadAddress: string): boolean;
    verifyPayID(thumbprint: string | undefined, input: PaymentInformation): Promise<VerificationResult>;
    verifySignedPayIDAddress(input: SignedPayIDAddress): Promise<jose.JWS.VerificationResult>;
    signPayIDAddress(key: jose.JWK.Key, input: UnsignedPayIDAddress): Promise<SignedPayIDAddress>;
}
