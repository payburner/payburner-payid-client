import * as jose from 'node-jose';
import {UnsignedPayIDAddress} from "../model/interfaces/UnsignedPayIDAddress";
import {SignedPayIDAddress} from "../model/interfaces/SignedPayIDAddress";
import {PaymentInformation} from "../model/interfaces/PaymentInformation";
import {UnsignedPayIDAddressImpl} from "../model/impl/UnsignedPayIDAddressImpl";
import {Address} from "../model/interfaces/Address";
import {ResolvedPayID} from "../model/impl/ResolvedPayID";

export class PayIDUtils {

    constructor() {

    }


    newKeyStore(): jose.JWK.KeyStore {
        return jose.JWK.createKeyStore();
    }

    newKey(): Promise<jose.JWK.Key> {
        return this.newKeyStore().generate("RSA", 2048, {alg: "RS512", key_ops: ["sign", "decrypt", "unwrap"]});
    }

    fromPEM(pem: string): Promise<jose.JWK.Key> {
        return jose.JWK.createKeyStore().add(pem, 'pem');
    }

    signPayID(key: jose.JWK.Key, input: PaymentInformation): Promise<PaymentInformation> {
        const self = this;
        const promises = new Array<Promise<SignedPayIDAddress>>();
        input.addresses.forEach((address) => {
            const unsigned = new UnsignedPayIDAddressImpl(
                input.payId as string,
                address as Address);
            promises.push(self.signPayIDAddress(key, unsigned))
        });
        return new Promise<PaymentInformation>(function(resolve, reject) {
            Promise.all(promises as Array<Promise<SignedPayIDAddress>>).then(function(values){
               resolve(new ResolvedPayID(input.addresses, input.payId, input.memo, input.proofOfControlSignature, values))
            });
        })
    }


    verifySignedPayIDAddress(input: SignedPayIDAddress): Promise<jose.JWS.VerificationResult> {

        return jose.JWS.createVerify().verify(input, {
            allowEmbeddedKey: true,
            handlers: {
                name: true
            }
        });
    }

    signPayIDAddress(key: jose.JWK.Key, input: UnsignedPayIDAddress): Promise<SignedPayIDAddress> {
        var opts = {
            compact: false,
            fields: {
                name: 'identityKey',
                alg: 'RS512',
                typ: 'JOSE+JSON',
                crit: ['name']
            },
            handlers: {
                name: true
            }
        };
        return new Promise<SignedPayIDAddress>(function (resolve, reject) {
            jose.JWS.createSign(opts, {
                key: key,
                reference: "jwk"
            }).update(JSON.stringify(input), "utf-8").final().then(function (signed) {
                const unknownData = signed as unknown;
                resolve(unknownData as SignedPayIDAddress);
            }).catch(function (error) {
                reject(error);
            });
        });

    }
}