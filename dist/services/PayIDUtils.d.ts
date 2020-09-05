import * as jose from 'node-jose';
import { UnsignedPayIDAddress } from "../model/interfaces/UnsignedPayIDAddress";
import { SignedPayIDAddress } from "../model/interfaces/SignedPayIDAddress";
import { PaymentInformation } from "../model/interfaces/PaymentInformation";
import { VerificationResult } from "../model/impl/VerificationResult";
export declare class PayIDUtils {
    constructor();
    newKeyStore(): jose.JWK.KeyStore;
    newKey(): Promise<jose.JWK.Key>;
    fromPEM(pem: string): Promise<jose.JWK.Key>;
    signPayID(key: jose.JWK.Key, input: PaymentInformation): Promise<PaymentInformation>;
    verifyPayID(thumbprint: string | undefined, input: PaymentInformation): Promise<VerificationResult>;
    verifySignedPayIDAddress(input: SignedPayIDAddress): Promise<jose.JWS.VerificationResult>;
    signPayIDAddress(key: jose.JWK.Key, input: UnsignedPayIDAddress): Promise<SignedPayIDAddress>;
}
