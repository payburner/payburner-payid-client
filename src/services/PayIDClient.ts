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

/**
 * This is a derivative work of https://github.com/payid-org/payid/blob/master/src/services/metrics.ts
 *
 */

export class PayIDClient {

    constructor(tolerant: boolean = true) {
        this.tolerant = tolerant;
    }

    tolerant: boolean;

    isASCII( input: string )  {
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

    resolveRawPayID( payID: string, payIDHeader?:PayIDHeader ) : Promise<any> {
        const parsedPayID = this.parsePayIDUri(payID);

        return new Promise<ResolvedPayID>( function( resolve , reject ) {
            if (typeof parsedPayID === 'undefined') {
                reject({error:'unparseable payid'});
                return;
            }

            axios.get('https://' + parsedPayID.host + '/' + parsedPayID.path, { headers: {
                    'Accept': (typeof payIDHeader === 'undefined'?PayIDHeader.ALL:payIDHeader),
                    'PayID-Version': '1.0'
                }} )
            .then(function(response) {
                resolve(response.data);
            }).catch(function(error) {
                resolve(error);
            });
        })
    }

    parsePayIDFromData( data: any) : Promise<ResolvedPayID> {
        const self = this;
        return new Promise<ResolvedPayID>(function(resolve, reject) {

            if (typeof data.addresses === 'undefined') {
                const errorMsg = 'Problem resolving the payId -- missing address segment';
                reject({error: errorMsg});
            }

            const addresses = new Array<ResolvedAddress>();

            data.addresses.forEach((address: any)=>{
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

                const paymentNetwork = address.paymentNetwork;
                if (typeof paymentNetwork === undefined) {
                    console.log('address is missing paymentNetwork');
                    return;
                }
                let addressDetailsVal = null;
                if (addressDetailsTypeVal === AddressDetailsType.CryptoAddress) {
                    addressDetailsVal = new ResolvedCryptoAddressDetails(addressDetails.address, addressDetails.tag);
                }
                else {
                    addressDetailsVal = new ResolvedAchAddressDetails(addressDetails.routingNumber, addressDetails.accountNumber);
                }
                const environment = address.environment;
                addresses.push( new ResolvedAddress(addressDetailsVal, addressDetailsTypeVal, paymentNetwork, environment) );

            });

            resolve(new ResolvedPayID(addresses, data.payId));
        });
    }


    resolvePayID(payID: string) : Promise<ResolvedPayID> {

        const self = this;

        return new Promise<ResolvedPayID>( function( resolve , reject ) {

            self.resolveRawPayID(payID).then(function(data) {

                if (!payID.startsWith(data.payId)) {
                    const errorMsg = 'Problem resolving the payId -- the record returned does not match the request';
                    console.log(errorMsg);
                    if (!self.tolerant) {
                        reject({error: errorMsg});
                    }
                }
                self.parsePayIDFromData( data ).then(function(resolvedPayId) {
                    resolve(resolvedPayId);
                }).catch(function(error) {
                    reject(error);
                })
            }).catch(function(error) {
                reject(error);
            });

        })
    }

    seekAddressOfType(resolvedPayID: ResolvedPayID, payIdAddressType: PayIDAddressType) : Address | undefined {
        const addresses = resolvedPayID.addresses.filter((address)=> {
           if(address.paymentNetwork.toLowerCase() === payIdAddressType.network.toLowerCase()) {
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

    getPayIDAddressTypes() : PayIDAddressTypes {
        return new PayIDAddressTypes();
    }

}
