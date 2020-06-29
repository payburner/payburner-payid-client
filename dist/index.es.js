import axios from 'axios';

var PayIDHeader;
(function (PayIDHeader) {
    PayIDHeader["ALL"] = "application/payid+json";
    PayIDHeader["XRPL_MAINNET"] = "application/xrpl-mainnet+json";
    PayIDHeader["XRPL_DEVNET"] = "application/xrpl-devnet+json";
    PayIDHeader["XRPL_TESTNET"] = "application/xrpl-testnet+json";
    PayIDHeader["ACH"] = "application/ach+json";
    PayIDHeader["BTC_MAINNET"] = "application/btc-mainnet+json";
    PayIDHeader["BTC_TESTNET"] = "application/btc-testnet+json";
    PayIDHeader["ETH_MAINNET"] = "application/eth-mainnet+json";
})(PayIDHeader || (PayIDHeader = {}));

var PayIDNetworks;
(function (PayIDNetworks) {
    PayIDNetworks["XRPL"] = "XRPL";
    PayIDNetworks["ACH"] = "ACH";
    PayIDNetworks["BTC"] = "BTC";
    PayIDNetworks["ETH"] = "ETH";
})(PayIDNetworks || (PayIDNetworks = {}));

var AddressDetailsType;
(function (AddressDetailsType) {
    AddressDetailsType["CryptoAddress"] = "CryptoAddressDetails";
    AddressDetailsType["AchAddress"] = "AchAddressDetails";
})(AddressDetailsType || (AddressDetailsType = {}));

var XrplMainnet = /** @class */ (function () {
    function XrplMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.XRPL_MAINNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplMainnet;
}());

var XrplDevnet = /** @class */ (function () {
    function XrplDevnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'DEVNET';
        this.header = PayIDHeader.XRPL_DEVNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplDevnet;
}());

var XrplTestnet = /** @class */ (function () {
    function XrplTestnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'TESTNET';
        this.header = PayIDHeader.XRPL_TESTNET;
        this.network = PayIDNetworks.XRPL;
    }
    return XrplTestnet;
}());

var Ach = /** @class */ (function () {
    function Ach() {
        this.addressDetailsType = AddressDetailsType.AchAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.ACH;
        this.network = PayIDNetworks.ACH;
    }
    return Ach;
}());

var BtcMainnet = /** @class */ (function () {
    function BtcMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.BTC_MAINNET;
        this.network = PayIDNetworks.BTC;
    }
    return BtcMainnet;
}());

var BtcTestnet = /** @class */ (function () {
    function BtcTestnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'TESTNET';
        this.header = PayIDHeader.BTC_TESTNET;
        this.network = PayIDNetworks.BTC;
    }
    return BtcTestnet;
}());

var EthMainnet = /** @class */ (function () {
    function EthMainnet() {
        this.addressDetailsType = AddressDetailsType.CryptoAddress;
        this.environment = 'MAINNET';
        this.header = PayIDHeader.ETH_MAINNET;
        this.network = PayIDNetworks.ETH;
    }
    return EthMainnet;
}());

var PayIDAddressTypes = /** @class */ (function () {
    function PayIDAddressTypes() {
        this.XRPL_MAINNET = new XrplMainnet();
        this.XRPL_TESTNET = new XrplTestnet();
        this.XRPL_DEVNET = new XrplDevnet();
        this.ACH = new Ach();
        this.BTC_MAINNET = new BtcMainnet();
        this.BTC_TESTNET = new BtcTestnet();
        this.ETH_MAINNET = new EthMainnet();
        this.ALL_TYPES = [
            this.XRPL_MAINNET, this.XRPL_DEVNET, this.XRPL_TESTNET, this.ACH, this.BTC_MAINNET, this.BTC_TESTNET, this.ETH_MAINNET
        ];
    }
    return PayIDAddressTypes;
}());

/**
 * This is a derivative work of https://github.com/payid-org/payid/blob/master/src/config.ts
 */
var ParsedPayID = /** @class */ (function () {
    function ParsedPayID(host, path) {
        this.host = host;
        this.path = path;
    }
    return ParsedPayID;
}());

var ResolvedPayID = /** @class */ (function () {
    function ResolvedPayID(addresses, payId, memo, proofOfSignature) {
        this.addresses = addresses;
        if (typeof payId !== 'undefined') {
            this.payId = payId;
        }
        if (typeof memo !== 'undefined') {
            this.memo = memo;
        }
        if (typeof proofOfSignature !== 'undefined') {
            this.proofOfControlSignature = proofOfSignature;
        }
    }
    return ResolvedPayID;
}());

var ResolvedAddress = /** @class */ (function () {
    function ResolvedAddress(addressDetails, addressDetailsType, network, environment) {
        this.addressDetails = addressDetails;
        if (typeof environment !== undefined) {
            this.environment = environment;
        }
        this.paymentNetwork = network;
        this.addressDetailsType = addressDetailsType;
    }
    return ResolvedAddress;
}());

var ResolvedCryptoAddressDetails = /** @class */ (function () {
    function ResolvedCryptoAddressDetails(address, tag) {
        this.address = address;
        if (typeof tag !== undefined) {
            this.tag = tag;
        }
    }
    return ResolvedCryptoAddressDetails;
}());

var ResolvedAchAddressDetails = /** @class */ (function () {
    function ResolvedAchAddressDetails(routingNumber, accountNumber) {
        this.routingNumber = routingNumber;
        this.accountNumber = accountNumber;
    }
    return ResolvedAchAddressDetails;
}());

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
            resolve(new ResolvedPayID(addresses, data.payId));
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

export { PayIDAddressTypes, PayIDClient, PayIDHeader, PayIDNetworks };
