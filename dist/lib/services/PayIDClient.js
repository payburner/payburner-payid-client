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
import axios from 'axios';
import { ParsedPayID } from '../model/ParsedPayID';
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
import { ResolvedAddress } from "../model/impl/ResolvedAddress";
import { AddressDetailsType } from "../model/interfaces/AddressDetailsType";
import { ResolvedCryptoAddressDetails } from "../model/impl/ResolvedCryptoAddressDetails";
import { ResolvedAchAddressDetails } from "../model/impl/ResolvedAchAddressDetails";
import { PayIDAddressTypes } from "../model/types/PayIDAddressTypes";
import { PayIDHeader } from "../model/types/PayIDHeader";
import { VerifiedPayIDUtils } from "./VerifiedPayIDUtils";
var PayIDClient = /** @class */ (function () {
    function PayIDClient(tolerant) {
        if (tolerant === void 0) { tolerant = true; }
        this.tolerant = tolerant;
        this.verifiedPayIDUtils = new VerifiedPayIDUtils();
    }
    PayIDClient.prototype.isASCII = function (input) {
        // eslint-disable-next-line no-control-regex -- The ASCII regex uses control characters
        return /^[\x00-\x7F]*$/u.test(input);
    };
    PayIDClient.prototype.parsePayIDUri = function (payId) {
        if (!this.isASCII(payId)) {
            return undefined;
        }
        // Split on the last occurrence of '$'
        var lastDollarIndex = payId.lastIndexOf('$');
        if (lastDollarIndex === -1) {
            return undefined;
        }
        var path = payId.slice(0, lastDollarIndex);
        var host = payId.slice(lastDollarIndex + 1);
        // Validate the host and path have values.
        if (host.length === 0 || path.length === 0) {
            return undefined;
        }
        return new ParsedPayID(host, path);
    };
    PayIDClient.prototype.resolveRawPayID = function (payID, payIDHeader) {
        var parsedPayID = this.parsePayIDUri(payID);
        return new Promise(function (resolve, reject) {
            if (typeof parsedPayID === 'undefined') {
                reject({ error: 'unparseable payid' });
                return;
            }
            axios.get('https://' + parsedPayID.host + '/' + parsedPayID.path, { headers: {
                    'Accept': (typeof payIDHeader === 'undefined' ? PayIDHeader.ALL : payIDHeader),
                    'PayID-Version': '1.0'
                } })
                .then(function (response) {
                resolve(response.data);
            }).catch(function (error) {
                resolve(error);
            });
        });
    };
    PayIDClient.prototype.parsePayIDFromData = function (data) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (typeof data.addresses === 'undefined') {
                var errorMsg = 'Problem resolving the payId -- missing address segment';
                reject({ error: errorMsg });
            }
            var addresses = new Array();
            data.addresses.forEach(function (address) {
                var addressDetailsType = address.addressDetailsType;
                var addressDetails = address.addressDetails;
                var addressDetailsTypeVal = null;
                if (typeof addressDetails === undefined) {
                    console.log('address is missing address details.  skipping');
                    return;
                }
                if (typeof addressDetailsType === undefined) {
                    if (!self.tolerant) {
                        console.log('address is missing addressDetailsType and we are intolerant.  skipping');
                        return;
                    }
                    if (typeof addressDetails.address !== undefined) {
                        addressDetailsTypeVal = AddressDetailsType.CryptoAddress;
                    }
                    else if (typeof addressDetails.routingNumber !== undefined && typeof addressDetails.accountNumber !== undefined) {
                        addressDetailsTypeVal = AddressDetailsType.AchAddress;
                    }
                }
                else {
                    if (addressDetailsType === AddressDetailsType.CryptoAddress) {
                        if (typeof addressDetails.address !== undefined) {
                            addressDetailsTypeVal = AddressDetailsType.CryptoAddress;
                        }
                    }
                    else if (addressDetailsType === AddressDetailsType.AchAddress) {
                        if (typeof addressDetails.routingNumber !== undefined && typeof addressDetails.accountNumber !== undefined) {
                            addressDetailsTypeVal = AddressDetailsType.AchAddress;
                        }
                    }
                }
                if (addressDetailsTypeVal === null) {
                    console.log('Unknown address details type.  skipping');
                    return;
                }
                var paymentNetwork = address.paymentNetwork;
                if (typeof paymentNetwork === undefined) {
                    console.log('address is missing paymentNetwork');
                    return;
                }
                var addressDetailsVal = null;
                if (addressDetailsTypeVal === AddressDetailsType.CryptoAddress) {
                    addressDetailsVal = new ResolvedCryptoAddressDetails(addressDetails.address, addressDetails.tag);
                }
                else {
                    addressDetailsVal = new ResolvedAchAddressDetails(addressDetails.routingNumber, addressDetails.accountNumber);
                }
                var environment = address.environment;
                addresses.push(new ResolvedAddress(addressDetailsVal, addressDetailsTypeVal, paymentNetwork, environment));
            });
            resolve(new ResolvedPayID(addresses, data.payId, undefined, undefined, undefined));
        });
    };
    PayIDClient.prototype.resolvePayID = function (payID) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) {
            self.resolveRawPayID(payID).then(function (data) {
                if (!payID.startsWith(data.payId)) {
                    var errorMsg = 'Problem resolving the payId -- the record returned does not match the request';
                    console.log(errorMsg);
                    if (!self.tolerant) {
                        reject({ error: errorMsg });
                    }
                }
                self.parsePayIDFromData(data).then(function (resolvedPayId) { return __awaiter(_this, void 0, void 0, function () {
                    var verificationResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, self.verifiedPayIDUtils.verifyPayID(undefined, resolvedPayId)];
                            case 1:
                                verificationResult = _a.sent();
                                if (!verificationResult.verified) {
                                    reject(verificationResult.errorMessage);
                                }
                                else {
                                    resolve(resolvedPayId);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); }).catch(function (error) {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    PayIDClient.prototype.seekAddressOfType = function (resolvedPayID, payIdAddressType) {
        var addresses = resolvedPayID.addresses.filter(function (address) {
            if (address.paymentNetwork.toLowerCase() === payIdAddressType.network.toLowerCase()) {
                if (typeof address.environment !== 'undefined' && address.environment === payIdAddressType.environment) {
                    return true;
                }
            }
            return false;
        });
        if (addresses.length > 0) {
            return addresses[0];
        }
        return undefined;
    };
    PayIDClient.prototype.getPayIDAddressTypes = function () {
        return new PayIDAddressTypes();
    };
    return PayIDClient;
}());
export { PayIDClient };
//# sourceMappingURL=PayIDClient.js.map