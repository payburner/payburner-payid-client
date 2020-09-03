import {PayIDClient} from '../index';
import {XrplMainnet} from "../model/types/XrplMainnet";
import {AddressDetailsType} from "../model/interfaces/AddressDetailsType";
import {CryptoAddressDetails} from "../model/interfaces/CryptoAddressDetails";
import {PayIDNetworks} from "../model/types/PayIDNetworks";
import {PayIDUtils} from "../index";
import * as jose from 'node-jose';
import {UnsignedPayIDAddressImpl} from "../model/impl/UnsignedPayIDAddressImpl";
import {Address} from "../model/interfaces/Address";
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
    const payIDUtils = new PayIDUtils();
    const payIDClient = new PayIDClient(true);
    const key = await payIDUtils.newKey();
    console.log(key.toJSON(false));
    expect(key.kty ).toBe('RSA')
    expect(key.length).toBe(2048);
    console.log(key.toPEM(false));

    const pem = key.toPEM(false);
    const key2 = await payIDUtils.fromPEM(pem);
    console.log(key2.toJSON(false));

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

    const unsigned = new UnsignedPayIDAddressImpl(
        resolvedPayID.payId as string,
         address as Address);
    const signed = await payIDUtils.signPayIDAddress(key, unsigned);
    console.log('SIGNED:' +  JSON.stringify(signed, null, 2) );
    const originalThumbprint = await key.thumbprint('SHA-256');
    const verif = await payIDUtils.verifySignedPayIDAddress(signed);
    const verifiedThumbprint = await verif.key.thumbprint('SHA-256');
    expect(verifiedThumbprint.toString('hex')).toBe(originalThumbprint.toString('hex'));

    const signedPayId = await payIDUtils.signPayID(key, resolvedPayID);

    console.log('SIGNED PAYID:' + JSON.stringify(signedPayId, null, 2));

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

