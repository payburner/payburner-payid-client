import * as jose from 'node-jose';
import { UnsignedPayIDAddressImpl } from "../model/impl/UnsignedPayIDAddressImpl";
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
import { VerificationResult } from "../model/impl/VerificationResult";
import { VerificationErrorCode } from "../model/interfaces/VerificationErrorCode";
import { AddressDetailsType } from "../model/interfaces/AddressDetailsType";
import { util } from "node-jose";
var base64url = util.base64url;
var VerifiedPayIDUtils = /** @class */ (function () {
    function VerifiedPayIDUtils() {
    }
    VerifiedPayIDUtils.prototype.newKeyStore = function () {
        return jose.JWK.createKeyStore();
    };
    VerifiedPayIDUtils.prototype.newKey = function () {
        return this.newKeyStore().generate("EC", "P-256", { alg: "ES256", key_ops: ["sign", "verify"] });
    };
    VerifiedPayIDUtils.prototype.fromPEM = function (pem) {
        return jose.JWK.createKeyStore().add(pem, 'pem');
    };
    VerifiedPayIDUtils.prototype.signPayID = function (key, input) {
        var self = this;
        var promises = new Array();
        input.addresses.forEach(function (address) {
            var unsigned = new UnsignedPayIDAddressImpl(input.payId, address);
            promises.push(self.signPayIDAddress(key, unsigned));
        });
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function (values) {
                resolve(new ResolvedPayID(input.addresses, input.payId, input.memo, input.proofOfControlSignature, values));
            });
        });
    };
    VerifiedPayIDUtils.prototype.matchAddress = function (address, payloadAddress) {
        var parsedPayloadAddress = JSON.parse(atob(payloadAddress));
        if (address.environment !== parsedPayloadAddress.payIdAddress.environment) {
            return false;
        }
        if (address.paymentNetwork !== parsedPayloadAddress.payIdAddress.paymentNetwork) {
            return false;
        }
        if (address.addressDetailsType !== parsedPayloadAddress.payIdAddress.addressDetailsType) {
            return false;
        }
        if (address.addressDetailsType === AddressDetailsType.CryptoAddress) {
            var cryptoAddressDetails = address.addressDetails;
            var payloadAddressDetails = parsedPayloadAddress.payIdAddress.addressDetails;
            if (cryptoAddressDetails.address !== payloadAddressDetails.address) {
                return false;
            }
            if (cryptoAddressDetails.tag !== payloadAddressDetails.tag) {
                return false;
            }
        }
        return true;
    };
    VerifiedPayIDUtils.prototype.verifyPayID = function (thumbprint, input) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (typeof input.verifiedAddresses === 'undefined' || input.verifiedAddresses === null || input.verifiedAddresses.length === 0) {
                resolve(new VerificationResult(true));
            }
            else if (typeof thumbprint === 'undefined' || thumbprint === null) {
                resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_BUT_NO_THUMBPRINT, 'The payID has verified addresses, but no thumbprint was provided'));
            }
            else {
                var promises_1 = new Array();
                input.verifiedAddresses.forEach(function (verifiedAddress) {
                    promises_1.push(self.verifySignedPayIDAddress(verifiedAddress));
                });
                Promise.all(promises_1).then(function (values) {
                    // now we need to verify the thumbprint
                    var thumbprintPromises = new Array();
                    values.forEach(function (verificationResult) {
                        console.log('Verification Result from Address:' + JSON.stringify(verificationResult));
                        thumbprintPromises.push(verificationResult.key.thumbprint('SHA-256'));
                    });
                    Promise.all(thumbprintPromises).then(function (thumbprintValues) {
                        var verifiedAllThumbprints = true;
                        thumbprintValues.forEach(function (buffer) {
                            var buff = buffer;
                            if (thumbprint !== base64url.encode(buff, 'base64')) {
                                console.log('Failed Thumbprint Verification.  Calculated:' + buff.toString('hex') + ', Provided:' + thumbprint);
                                verifiedAllThumbprints = false;
                            }
                        });
                        if (!verifiedAllThumbprints) {
                            resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_KEYS_DO_NOT_MATCH_THUMBPRINT, 'The payID has verified addresses and the thumbprint does not match the embedded keys'));
                        }
                        else {
                            resolve(new VerificationResult(true));
                        }
                    });
                }).catch(function (error) {
                    console.log('ERROR:' + error);
                    console.log('ERROR:' + JSON.stringify(error));
                    resolve(new VerificationResult(false, VerificationErrorCode.SYSTEM_ERROR_VERIFYING, 'We encountered a system error verifying the addresses -- ' + (typeof error === 'string' ? error : JSON.stringify(error))));
                });
            }
        });
    };
    VerifiedPayIDUtils.prototype.verifySignedPayIDAddress = function (input) {
        console.log('Verifying payID Address:' + JSON.stringify(input, null, 2));
        return jose.JWS.createVerify().verify(input, {
            allowEmbeddedKey: true,
            handlers: {
                name: true,
                b64: true
            }
        });
    };
    VerifiedPayIDUtils.prototype.signPayIDAddress = function (key, input) {
        var opts = {
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
        return new Promise(function (resolve, reject) {
            jose.JWS.createSign(opts, {
                key: key,
                reference: 'jwk'
            }).update(JSON.stringify(input), "utf-8").final().then(function (signed) {
                var unknownData = signed;
                resolve(unknownData);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    return VerifiedPayIDUtils;
}());
export { VerifiedPayIDUtils };
//# sourceMappingURL=VerifiedPayIDUtils.js.map