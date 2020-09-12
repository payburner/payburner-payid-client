import {PayIDClient, PayIDPublicKeyThumbprint, PayIDThumbprintLookupService} from '../index';
import {XrplMainnet} from "../model/types/XrplMainnet";
import {AddressDetailsType} from "../model/interfaces/AddressDetailsType";
import {CryptoAddressDetails} from "../model/interfaces/CryptoAddressDetails";
import {PayIDNetworks} from "../model/types/PayIDNetworks";
import {VerifiedPayIDUtils} from "../services/VerifiedPayIDUtils";
import {UnsignedPayIDAddressImpl} from "../model/impl/UnsignedPayIDAddressImpl";
import {Address} from "../model/interfaces/Address";
import {SignedPayIDAddress} from "../model/interfaces/SignedPayIDAddress";
import {PaymentInformation} from "../model/interfaces/PaymentInformation";
import * as jose from 'node-jose';
import {util} from "node-jose";
import base64url = util.base64url;
class TestLookupService implements PayIDThumbprintLookupService {

    payIDThumbprintMap = new Map<string, string>();

    setPayIDThumbprint(payID:string, thumbprint:string) {
        this.payIDThumbprintMap.set(payID, thumbprint);
    }

    resolvePayIDThumbprint(payID: string): Promise<PayIDPublicKeyThumbprint> {
        return new Promise<PayIDPublicKeyThumbprint>((resolve, reject)=>{
            const thumbprint = this.payIDThumbprintMap.get(payID);
            if (typeof thumbprint !== 'undefined') {
                resolve( new PayIDPublicKeyThumbprint(payID, thumbprint));
            }
            else {
                reject({error: 'not found'});
            }
        });

    }

}

test('Test resolve XRPL MAINNET', async () => {
    const payIDClient = new PayIDClient(true);
    const resolvedPayID = await payIDClient.resolvePayID('LaSourceAfrique$payburner.com');
    const address = payIDClient.seekAddressOfType(resolvedPayID, new XrplMainnet());
    expect(address).toBeDefined();
    if (typeof address !== 'undefined') {
        expect(address.addressDetails).toBeDefined();
        expect(address.addressDetailsType).toBe(AddressDetailsType.CryptoAddress);
        const addressDetails = address.addressDetails as (CryptoAddressDetails);
        expect(addressDetails.address).toBeDefined();
        expect(addressDetails.address).toBe('rKZKRYe6YhskeeDN8YSdPdv6zkMV6LfkR4');
        expect(address.paymentNetwork).toBe(PayIDNetworks.XRPL);
        expect(address.environment).toBe(new XrplMainnet().environment);
    }
});

test('Test Signing and Verification', async () => {

    const testLookupService = new TestLookupService();

    const payIDUtils = new VerifiedPayIDUtils();
    const payIDClient = new PayIDClient(true, testLookupService);

    const key = await payIDUtils.newKey();

    console.log(key.toJSON(false));
    expect(key.kty).toBe('EC')
    expect(key.length).toBe(256);
    console.log(key.toPEM(false));

    const pem = key.toPEM(false);
    const key2 = await payIDUtils.fromPEM(pem);
    console.log(key2.toJSON(false));
    console.log(base64url.encode(await key2.thumbprint('SHA-256')));

});

test('Test Resolving and Verification', async () => {

    const testLookupService = new TestLookupService();
    const payIDClient = new PayIDClient(true, testLookupService);
    testLookupService.setPayIDThumbprint('test$payid.mayurbhandary.com', 'E5WwMgONPouv-eddlXeUJuvedGIuLZce_h8K8EXbyV8')
    const resolved2 = await payIDClient.resolvePayID('test$payid.mayurbhandary.com', true);
    console.log('Resolved:' + JSON.stringify(resolved2, null, 2));

});

test('Test parse raw XRPL MAINNET', async () => {
    const payIDClient = new PayIDClient(true);
    const rawPayId = {
        "payId": "LaSourceAfrique$payburner.com",
        "addresses": [
            {
                "paymentNetwork": "XRPL",
                "environment": "MAINNET",
                "addressDetailsType": "CryptoAddressDetails",
                "addressDetails": {
                    "address": "rKZKRYe6YhskeeDN8YSdPdv6zkMV6LfkR4"
                }
            }
        ]
    };
    const resolvedPayID = await payIDClient.parsePayIDFromData(rawPayId );
    const address = payIDClient.seekAddressOfType(resolvedPayID, new XrplMainnet());
    expect(address).toBeDefined();
    if (typeof address !== 'undefined') {

        expect(address.addressDetails).toBeDefined();
        expect(address.addressDetailsType).toBe(AddressDetailsType.CryptoAddress);
        const addressDetails = address.addressDetails as (CryptoAddressDetails);
        expect(addressDetails.address).toBeDefined();
        expect(addressDetails.address).toBe('rKZKRYe6YhskeeDN8YSdPdv6zkMV6LfkR4');
        expect(address.paymentNetwork).toBe(PayIDNetworks.XRPL);
        expect(address.environment).toBe(new XrplMainnet().environment);
    }
});


