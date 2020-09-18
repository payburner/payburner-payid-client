import * as jose from 'node-jose';
import {util} from 'node-jose';
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
import {ResolvedCryptoAddressWithThumbprint} from "..";
import {ResolvedCryptoAddressWithThumbprintResponse} from "../model/impl/ResolvedCryptoAddressWithThumbprintResponse";
import base64url = util.base64url;

export class VerifiedPayIDUtils {

    newKeyStore(): jose.JWK.KeyStore {
        return jose.JWK.createKeyStore();
    }

    newKey(): Promise<jose.JWK.Key> {
        return this.newKeyStore().generate("EC", "P-256", {alg: "ES256", key_ops: ["sign", "verify"]});
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
        return new Promise<PaymentInformation>((resolve, reject) => {
            Promise.all(promises).then((values) => {
                resolve(new ResolvedPayID(input.addresses, input.payId, input.memo, input.proofOfControlSignature, values))
            });
        })
    }

    matchAddress(address: Address, payloadAddress: string) {
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

    getThumbprint(key: jose.JWK.Key): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            key.thumbprint('SHA-256').then((buff) => {
                resolve(base64url.encode(buff, 'base64'));
            });
        });
    }


    getResolvedCryptoAddressWithThumbprint(input: PaymentInformation, network: string, environment: string): Promise<ResolvedCryptoAddressWithThumbprintResponse> {
        const self = this;
        return new Promise<ResolvedCryptoAddressWithThumbprintResponse>((resolve, reject) => {
            if (typeof input.verifiedAddresses === 'undefined' || input.verifiedAddresses === null || input.verifiedAddresses.length === 0) {
                resolve(new ResolvedCryptoAddressWithThumbprintResponse());
            } else {

                try {
                    let count = 0;
                    input.verifiedAddresses.forEach((verifiedAddress) => {
                        const address = (JSON.parse(verifiedAddress.payload) as UnsignedPayIDAddress).payIdAddress;
                        if (address.environment === environment && address.paymentNetwork === network) {
                            self.verifySignedPayIDAddress(verifiedAddress)
                            .then( (verificationResult: jose.JWS.VerificationResult) => {
                                self.getThumbprint(verificationResult.key)
                                .then((thumbprint: string) => {
                                    resolve(new ResolvedCryptoAddressWithThumbprintResponse(
                                        new ResolvedCryptoAddressWithThumbprint(
                                            network,
                                            environment,
                                            address,
                                            verificationResult.key,
                                            thumbprint,
                                            Buffer.from(thumbprint, 'utf8').toString('hex').toUpperCase(),
                                            self.thumbprintToHexMatrix(thumbprint)))
                                    );
                                });
                            });
                            count++;
                        }
                    });
                    // we didn't find any so let's resolve undefined.
                    if (count === 0) {
                        resolve(new ResolvedCryptoAddressWithThumbprintResponse())
                    }
                } catch (error) {
                    resolve(new ResolvedCryptoAddressWithThumbprintResponse());
                }
            }
        });
    }

    thumbprintToHexMatrix(thumbprint: string): string[][] {
        const hexified = Buffer.from(thumbprint, 'utf8').toString('hex');
        const chunked = hexified.match(/.{1,4}/g);
        if (chunked === null) {
            return new Array();
        }
        const response = new Array();
        for (let idx = 0; idx < chunked.length; idx++) {
            if (idx % 4 === 0) {
                response.push([]);
            }
            const chunk = chunked[idx];
            response[response.length - 1].push(chunk.toUpperCase());
        }
        return response;
    }

    verifyPayID(thumbprint: string | undefined, input: PaymentInformation): Promise<VerificationResult> {
        const self = this;
        return new Promise<VerificationResult>((resolve, reject) => {
            if (typeof input.verifiedAddresses === 'undefined' || input.verifiedAddresses === null || input.verifiedAddresses.length === 0) {
                resolve(new VerificationResult(true));
            } else if (typeof thumbprint === 'undefined' || thumbprint === null) {
                resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_BUT_NO_THUMBPRINT, 'The payID has verified addresses, but no thumbprint was provided'));
            } else {

                const promises = new Array<Promise<jose.JWS.VerificationResult>>();
                input.verifiedAddresses.forEach((verifiedAddress) => {
                    promises.push(self.verifySignedPayIDAddress(verifiedAddress));
                });
                Promise.all(promises).then((values) => {
                    // now we need to verify the thumbprint

                    const thumbprintPromises = new Array<Promise<string>>();
                    values.forEach((verificationResult: jose.JWS.VerificationResult) => {
                        console.log('Verification Result from Address:' + JSON.stringify(verificationResult));
                        thumbprintPromises.push(this.getThumbprint(verificationResult.key));
                    });

                    Promise.all(thumbprintPromises).then((thumbprintValues) => {
                        let verifiedAllThumbprints = true;
                        thumbprintValues.forEach((buffer) => {
                            const buff = buffer as string;
                            if (thumbprint !== buff) {
                                console.log('Failed Thumbprint Verification.  Calculated:' + buff + ', Provided:' + thumbprint);
                                verifiedAllThumbprints = false;
                            }
                        });
                        if (!verifiedAllThumbprints) {
                            resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_KEYS_DO_NOT_MATCH_THUMBPRINT, 'The payID has verified addresses and the thumbprint does not match the embedded keys'));
                        } else {
                            resolve(new VerificationResult(true));
                        }
                    });

                }).catch((error) => {
                    console.log('ERROR:' + error);
                    console.log('ERROR:' + JSON.stringify(error));
                    resolve(new VerificationResult(false, VerificationErrorCode.SYSTEM_ERROR_VERIFYING, 'We encountered a system error verifying the addresses -- ' + (typeof error === 'string' ? error : JSON.stringify(error))));
                });
            }
        });
    }

    verifySignedPayIDAddress(input: SignedPayIDAddress): Promise<jose.JWS.VerificationResult> {

        console.log('Verifying payID Address:' + JSON.stringify(input, null, 2));
        return jose.JWS.createVerify().verify(input, {
            allowEmbeddedKey: true,
            handlers: {
                name: true,
                b64: true
            }
        });
    }


    signPayIDAddress(key: jose.JWK.Key, input: UnsignedPayIDAddress): Promise<SignedPayIDAddress> {
        const opts = {
            compact: false,
            fields: {
                name: 'identityKey',
                alg: 'ES256',
                typ: 'JOSE+JSON',
                crit: ['name']
            },
            handlers: {
                name: true
            }
        };
        return new Promise<SignedPayIDAddress>((resolve, reject) => {
            jose.JWS.createSign(opts, {
                key,
                reference: 'jwk'
            }).update(JSON.stringify(input), "utf-8").final().then((signed) => {
                const unknownData = signed as unknown;
                resolve(unknownData as SignedPayIDAddress);
            }).catch((error) => {
                reject(error);
            });
        });

    }

}