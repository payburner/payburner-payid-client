import axios from 'axios';
import { ParsedPayID } from '../model/ParsedPayID';
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
import { ResolvedAddress } from "../model/impl/ResolvedAddress";
import { AddressDetailsType } from "../model/interfaces/AddressDetailsType";
import { ResolvedCryptoAddressDetails } from "../model/impl/ResolvedCryptoAddressDetails";
import { ResolvedAchAddressDetails } from "../model/impl/ResolvedAchAddressDetails";
import { PayIDAddressTypes } from "../model/types/PayIDAddressTypes";
import { PayIDHeader } from "../model/types/PayIDHeader";
var PayIDClient = /** @class */ (function () {
    function PayIDClient(tolerant) {
        if (tolerant === void 0) { tolerant = true; }
        this.tolerant = tolerant;
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
                self.parsePayIDFromData(data).then(function (resolvedPayId) {
                    resolve(resolvedPayId);
                }).catch(function (error) {
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