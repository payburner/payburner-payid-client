import * as jose from 'node-jose';
import {UnsignedPayIDAddress} from "../model/interfaces/UnsignedPayIDAddress";
import {SignedPayIDAddress} from "../model/interfaces/SignedPayIDAddress";
import {PaymentInformation} from "../model/interfaces/PaymentInformation";
import {UnsignedPayIDAddressImpl} from "../model/impl/UnsignedPayIDAddressImpl";
import {Address} from "../model/interfaces/Address";
import {ResolvedPayID} from "../model/impl/ResolvedPayID";
import {VerificationResult} from "../model/impl/VerificationResult";
import {VerificationErrorCode} from "../model/interfaces/VerificationErrorCode";
import {AddressDetailsType} from "../model/interfaces/AddressDetailsType";
import {CryptoAddressDetails} from "../model/interfaces/CryptoAddressDetails";

export class VerifiedPayIDUtils {

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

    matchAddress(address:Address, payloadAddress: string) {
        const parsedPayloadAddress = JSON.parse(atob(payloadAddress)) as UnsignedPayIDAddressImpl;
        if (address.environment !== parsedPayloadAddress.payIdAddress.environment) {
            return false
        }
        if (address.paymentNetwork !== parsedPayloadAddress.payIdAddress.paymentNetwork) {
            return false
        }
        if (address.addressDetailsType !== parsedPayloadAddress.payIdAddress.addressDetailsType) {
            return false
        }
        if (address.addressDetailsType === AddressDetailsType.CryptoAddress) {
            const cryptoAddressDetails = address.addressDetails as CryptoAddressDetails;
            const payloadAddressDetails = parsedPayloadAddress.payIdAddress.addressDetails as CryptoAddressDetails;
            if (cryptoAddressDetails.address !== payloadAddressDetails.address) {
                return false;
            }
            if (cryptoAddressDetails.tag !== payloadAddressDetails.tag) {
                return false;
            }
        }

        return true;
    }

    verifyPayID(thumbprint: string|undefined, input: PaymentInformation): Promise<VerificationResult> {
        const self = this;
        return new Promise<VerificationResult>(function(resolve, reject) {
          if (typeof input.verifiedAddresses === 'undefined' || input.verifiedAddresses === null || input.verifiedAddresses.length === 0) {
              resolve(new VerificationResult(true));
          }
          else if (typeof thumbprint === 'undefined' || thumbprint === null) {
              resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_BUT_NO_THUMBPRINT, 'The payID has verified addresses, but no thumbprint was provided'));
          }
          else if (input.addresses.length !== input.verifiedAddresses.length) {
              resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_AND_ADDRESSES_DIFFER_IN_LENGTH, 'The payID has verified addresses, but they differ in length from the addresses provided.'));
          }
          else {
              let verifiedAllMatch = true;
              for (var idx = 0; idx < input.addresses.length; idx++) {
                  if (!self.matchAddress(input.addresses[idx], input.verifiedAddresses[idx].payload)) {
                      console.log('ADDRESS:' + JSON.stringify(input.addresses[idx]));
                      console.log('PAYLOAD:' + atob(input.verifiedAddresses[idx].payload));
                     verifiedAllMatch = false;
                     break;
                  }
              }
              if (!verifiedAllMatch) {
                  resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_AND_ADDRESSES_DIFFER_CONTENT, 'The addresses in the verified address array differ from the the ones in the address array'));
                  return;
              }

              const promises = new Array<Promise<jose.JWS.VerificationResult>>();
              input.verifiedAddresses.forEach((verifiedAddress) => {
                  promises.push(self.verifySignedPayIDAddress(verifiedAddress));
              });
              Promise.all(promises as Array<Promise<jose.JWS.VerificationResult>>).then(function(values){
                  // now we need to verify the thumbprint

                    let verifiedAllThumbprints = true;
                    values.forEach( async (verificationResult: jose.JWS.VerificationResult) => {
                        const verifiedThumbprint = await verificationResult.key.thumbprint('SHA-256');
                        if (thumbprint !== verifiedThumbprint.toString('hex')) {
                            console.log('Verified:' + verifiedThumbprint.toString('hex'));
                            console.log('Thumbprint:' + thumbprint);
                            verifiedAllThumbprints = false;
                        }
                    });
                    if (!verifiedAllThumbprints) {
                        resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_KEYS_DO_NOT_MATCH_THUMBPRINT, 'The payID has verified addresses and the thumbprint does not match the embedded keys'));
                    }
                    else {
                        resolve(new VerificationResult(true));
                    }

              }).catch(function(error) {
                  resolve(new VerificationResult(false, VerificationErrorCode.SYSTEM_ERROR_VERIFYING, 'We encountered a system error verifying the addresses -- ' + (typeof error === 'string'?error:JSON.stringify(error))));
              });
          }
        });
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