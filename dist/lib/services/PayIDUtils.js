var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as jose from 'node-jose';
import { UnsignedPayIDAddressImpl } from "../model/impl/UnsignedPayIDAddressImpl";
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
import { VerificationResult } from "../model/impl/VerificationResult";
import { VerificationErrorCode } from "../model/interfaces/VerificationErrorCode";
var PayIDUtils = /** @class */ (function () {
    function PayIDUtils() {
    }
    PayIDUtils.prototype.newKeyStore = function () {
        return jose.JWK.createKeyStore();
    };
    PayIDUtils.prototype.newKey = function () {
        return this.newKeyStore().generate("RSA", 2048, { alg: "RS512", key_ops: ["sign", "decrypt", "unwrap"] });
    };
    PayIDUtils.prototype.fromPEM = function (pem) {
        return jose.JWK.createKeyStore().add(pem, 'pem');
    };
    PayIDUtils.prototype.signPayID = function (key, input) {
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
    PayIDUtils.prototype.verifyPayID = function (thumbprint, input) {
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
                    var _this = this;
                    var verifiedAllThumbprints = true;
                    values.forEach(function (verificationResult) { return __awaiter(_this, void 0, void 0, function () {
                        var verifiedThumbprint;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, verificationResult.key.thumbprint('SHA-256')];
                                case 1:
                                    verifiedThumbprint = _a.sent();
                                    if (thumbprint !== verifiedThumbprint.toString('hex')) {
                                        verifiedAllThumbprints = false;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    resolve(new VerificationResult(false, VerificationErrorCode.VERIFIED_ADDRESSES_KEYS_DO_NOT_MATCH_THUMBPRINT, 'The payID has verified addresses and the thumbprint does not match the embedded keys'));
                }).catch(function (error) {
                    resolve(new VerificationResult(false, VerificationErrorCode.SYSTEM_ERROR_VERIFYING, 'We encountered a system error verifying the addresses -- ' + (typeof error === 'string' ? error : JSON.stringify(error))));
                });
            }
        });
    };
    PayIDUtils.prototype.verifySignedPayIDAddress = function (input) {
        return jose.JWS.createVerify().verify(input, {
            allowEmbeddedKey: true,
            handlers: {
                name: true
            }
        });
    };
    PayIDUtils.prototype.signPayIDAddress = function (key, input) {
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
        return new Promise(function (resolve, reject) {
            jose.JWS.createSign(opts, {
                key: key,
                reference: "jwk"
            }).update(JSON.stringify(input), "utf-8").final().then(function (signed) {
                var unknownData = signed;
                resolve(unknownData);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    return PayIDUtils;
}());
export { PayIDUtils };
//# sourceMappingURL=PayIDUtils.js.map