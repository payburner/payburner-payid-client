import * as jose from 'node-jose';
import { UnsignedPayIDAddress } from "../model/interfaces/UnsignedPayIDAddress";
import { SignedPayIDAddress } from "../model/interfaces/SignedPayIDAddress";
import { PaymentInformation } from "../model/interfaces/PaymentInformation";
export declare class PayIDUtils {
    constructor();
    newKeyStore(): jose.JWK.KeyStore;
    newKey(): Promise<jose.JWK.Key>;
    fromPEM(pem: string): Promise<jose.JWK.Key>;
    signPayID(key: jose.JWK.Key, input: PaymentInformation): Promise<PaymentInformation>;
    verifySignedPayIDAddress(input: SignedPayIDAddress): Promise<jose.JWS.VerificationResult>;
    signPayIDAddress(key: jose.JWK.Key, input: UnsignedPayIDAddress): Promise<SignedPayIDAddress>;
}
