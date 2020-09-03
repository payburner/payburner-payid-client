import {PayIDClient} from '../index';
import {XrplMainnet} from "../model/types/XrplMainnet";
import {AddressDetailsType} from "../model/interfaces/AddressDetailsType";
import {CryptoAddressDetails} from "../model/interfaces/CryptoAddressDetails";
import {PayIDNetworks} from "../model/types/PayIDNetworks";
import {PayIDUtils} from "../index";
import * as jose from 'node-jose';
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

test('Test Signing', async () => {
    const payIDUtils = new PayIDUtils();
    const key = await payIDUtils.newKey();
    console.log(key.toJSON(false));
    expect(key.kty ).toBe('RSA')
    expect(key.length).toBe(2048);
    console.log(key.toPEM(false));

    const pem = key.toPEM(false);
    const key2 = await payIDUtils.fromPEM(pem);
    console.log(key2.toJSON(false));

    const payId = 'alice$payid.example';
    const xrpAddress = 'rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6';
    const addressDetails = {
        address: xrpAddress,
    }

    let address = {
        environment: 'TESTNET',
        paymentNetwork: 'XRPL',
        addressDetailsType: AddressDetailsType.CryptoAddress,
        addressDetails,
    }

    const unsigned = {
        payId,
        payIdAddress: address,
    }

    const signed = await payIDUtils.sign(key, unsigned);

    console.log('SIGNED:' +  JSON.stringify(signed, null, 2) );

    const verif = await payIDUtils.verify(signed);

    const thumbprint = await key.thumbprint('SHA-256');
    console.log('THUMBPRINT:' + thumbprint.toString('hex'));

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

