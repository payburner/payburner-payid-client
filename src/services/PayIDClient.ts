import axios from 'axios';
import {ParsedPayID} from '../model/ParsedPayID';
import {ResolvedPayID} from "../model/impl/ResolvedPayID";
import {Address} from "../model/interfaces/Address";
import {ResolvedAddress} from "../model/impl/ResolvedAddress";
import {PayIDAddressType} from "../model/types/PayIDAddressType";
import {AddressDetailsType} from "../model/interfaces/AddressDetailsType";
import {ResolvedCryptoAddressDetails} from "../model/impl/ResolvedCryptoAddressDetails";
import {ResolvedAchAddressDetails} from "../model/impl/ResolvedAchAddressDetails";
import {PayIDAddressTypes} from "../model/types/PayIDAddressTypes";
import {PayIDHeader} from "../model/types/PayIDHeader";

import {PayIDThumbprintLookupService} from "./PayIDThumbprintLookupService";

import {VerifiedPayIDUtils} from "./VerifiedPayIDUtils";
import {SignedPayIDAddress} from "../model/interfaces/SignedPayIDAddress";

export class PayIDClient {

    constructor(tolerant: boolean = true, payIDThumbprintServiceLookup?: PayIDThumbprintLookupService) {
        this.tolerant = tolerant;
        this.verifiedPayIDUtils = new VerifiedPayIDUtils();
        if (typeof payIDThumbprintServiceLookup !== 'undefined') {
            this.payIDThumbprintServiceLookup = payIDThumbprintServiceLookup;
        }

    }

    payIDThumbprintServiceLookup?: PayIDThumbprintLookupService;
    verifiedPayIDUtils: VerifiedPayIDUtils;
    tolerant: boolean;

    isASCII(input: string) {
        // eslint-disable-next-line no-control-regex -- The ASCII regex uses control characters
        return /^[\x00-\x7F]*$/u.test(input)
    }

    parsePayIDUri(payId: string) {
        if (!this.isASCII(payId)) {
            return undefined
        }

        // Split on the last occurrence of '$'
        const lastDollarIndex = payId.lastIndexOf('$')
        if (lastDollarIndex === -1) {
            return undefined
        }
        const path = payId.slice(0, lastDollarIndex)
        const host = payId.slice(lastDollarIndex + 1)

        // Validate the host and path have values.
        if (host.length === 0 || path.length === 0) {
            return undefined
        }

        return new ParsedPayID(host, path);
    }

    resolveRawPayID(payID: string, payIDHeader?: PayIDHeader): Promise<any> {
        const parsedPayID = this.parsePayIDUri(payID);

        return new Promise<ResolvedPayID>((resolve, reject) => {
            if (typeof parsedPayID === 'undefined') {
                reject({error: 'unparseable payid'});
                return;
            }

            axios.get('https://' + parsedPayID.host + '/' + parsedPayID.path, {
                headers: {
                    'Accept': (typeof payIDHeader === 'undefined' ? PayIDHeader.ALL : payIDHeader),
                    'PayID-Version': '1.0'
                }
            })
            .then((response) => {
                resolve(response.data);
            }).catch((error) => {
                resolve(error);
            });
        })
    }

    parsePayIDFromData(data: any): Promise<ResolvedPayID> {
        const self = this;
        return new Promise<ResolvedPayID>((resolve, reject) => {

            if (typeof data.addresses === 'undefined') {
                const errorMsg = 'Problem resolving the payId -- missing address segment';
                reject({error: errorMsg});
            }

            const addresses = new Array<ResolvedAddress>();
            const verifiedAddresses = new Array<SignedPayIDAddress>();

            data.addresses.forEach((address: any) => {
                const addressDetailsType = address.addressDetailsType;
                const addressDetails = address.addressDetails;
                let addressDetailsTypeVal = null;
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
                    } else if (typeof addressDetails.routingNumber !== undefined && typeof addressDetails.accountNumber !== undefined) {
                        addressDetailsTypeVal = AddressDetailsType.AchAddress;
                    }
                } else {
                    if (addressDetailsType === AddressDetailsType.CryptoAddress) {
                        if (typeof addressDetails.address !== undefined) {
                            addressDetailsTypeVal = AddressDetailsType.CryptoAddress;
                        }
                    } else if (addressDetailsType === AddressDetailsType.AchAddress) {
                        if (typeof addressDetails.routingNumber !== undefined && typeof addressDetails.accountNumber !== undefined) {
                            addressDetailsTypeVal = AddressDetailsType.AchAddress;
                        }
                    }
                }
                if (addressDetailsTypeVal === null) {
                    console.log('Unknown address details type.  skipping');
                    return;
                }

                const paymentNetwork = address.paymentNetwork;
                if (typeof paymentNetwork === undefined) {
                    console.log('address is missing paymentNetwork');
                    return;
                }
                let addressDetailsVal = null;
                if (addressDetailsTypeVal === AddressDetailsType.CryptoAddress) {
                    addressDetailsVal = new ResolvedCryptoAddressDetails(addressDetails.address, addressDetails.tag);
                } else {
                    addressDetailsVal = new ResolvedAchAddressDetails(addressDetails.routingNumber, addressDetails.accountNumber);
                }
                const environment = address.environment;
                addresses.push(new ResolvedAddress(addressDetailsVal, addressDetailsTypeVal, paymentNetwork, environment));

            });

            if (typeof data.verifiedAddresses !== 'undefined') {
                data.verifiedAddresses.forEach((verifiedAddress:SignedPayIDAddress)=>{
                    verifiedAddresses.push(verifiedAddress);
                });
            }

            resolve(new ResolvedPayID(addresses, data.payId, undefined, undefined,
                verifiedAddresses.length > 0 ? verifiedAddresses:undefined));
        });
    }

    validateResolvedPayID(payID: string, data: ResolvedPayID, verify: boolean) : Promise<ResolvedPayID>  {
        const self = this;
        return new Promise((resolve, reject) => {
            if (typeof data.payId === 'undefined') {
                reject('The resolved PayID does not have a payID field');
            }
            else if (!payID.startsWith(data.payId)) {
                const errorMsg = 'Problem resolving the payId -- the record returned does not match the request';
                console.log(errorMsg);
                if (!self.tolerant) {
                    reject({error: errorMsg});
                    return;
                }
            }
            self.parsePayIDFromData(data).then(async (resolvedPayId) => {
                if ((typeof resolvedPayId.verifiedAddresses === 'undefined'
                    || resolvedPayId.verifiedAddresses === null || resolvedPayId.verifiedAddresses.length === 0)) {
                    resolve(resolvedPayId);
                }
                else if (verify) {
                    if (typeof self.payIDThumbprintServiceLookup !== 'undefined') {
                        self.payIDThumbprintServiceLookup.resolvePayIDThumbprint(payID).then(async (thumbprint) => {
                            const verificationResult = await self.verifiedPayIDUtils.verifyPayID(thumbprint.thumbprint, resolvedPayId);
                            if (!verificationResult.verified) {
                                reject(verificationResult.errorMessage);
                            } else {
                                resolve(resolvedPayId);
                            }
                        }).catch((error) => {
                            reject('Error resolving thumbprint of public key for verified payID');
                        })

                    } else {
                        reject('You requested a verification, but provided no lookup service');
                    }

                } else {
                    resolve(resolvedPayId);
                }
            }).catch((error) => {
                reject(error);
            })
        });
    }

    resolvePayID(payID: string, verify: boolean = false): Promise<ResolvedPayID> {
        const self = this;
        return new Promise<ResolvedPayID>((resolve, reject) => {
            self.resolveRawPayID(payID).then((data) => {
                self.validateResolvedPayID(payID, data, verify).then((resolvedPayID) => {
                    resolve(resolvedPayID);
                }).catch((error)=>{
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        })
    }

    seekAddressOfType(resolvedPayID: ResolvedPayID, payIdAddressType: PayIDAddressType): Address | undefined {
        const addresses = resolvedPayID.addresses.filter((address) => {
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
    }

    getPayIDAddressTypes(): PayIDAddressTypes {
        return new PayIDAddressTypes();
    }

}
