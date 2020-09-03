import * as jose from 'node-jose';
export declare class PayIDUtils {
    constructor();
    newKeyStore(): jose.JWK.KeyStore;
    newKey(): Promise<jose.JWK.Key>;
    fromPEM(pem: string): Promise<jose.JWK.Key>;
    verify(input: any): Promise<any>;
    sign(key: jose.JWK.Key, input: any): Promise<any>;
}
