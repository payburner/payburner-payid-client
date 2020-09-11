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
});

test('Test Resolving and Verification', async () => {

    const testLookupService = new TestLookupService();
    const payIDClient = new PayIDClient(true, testLookupService);
    testLookupService.setPayIDThumbprint('payburn_test$payid.mayurbhandary.com', 'fb9f74297d121e2ef25e613906b0ae4763f5fe935d96441bcb492dfbb1fe1f4f')
    const signed = {"addresses":[],"payId":"payburn_test$payid.mayurbhandary.com","verifiedAddresses":[{"signatures":[{"name":"identityKey","protected":"eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NiIsInR5cCI6IkpPU0UrSlNPTiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0IiwibmFtZSJdLCJqd2siOnsiY3J2IjoiUC0yNTYiLCJ4IjoiMEE4RjhSdG54b3NmbFdCd1h3ajZkMExGWE9OSEllQlVxeXhJMDNrR1V0MCIsInkiOiJIdmFiem9GUWk0Mk9QaVp5bmRaTjhESTNRQjFibV82dFlweFRhYWxiOEJJIiwia3R5IjoiRUMiLCJraWQiOiItNTkwS1gwU0hpN3lYbUU1QnJDdVIyUDFfcE5kbGtRYnkwa3QtN0gtSDA4In19","signature":"a6H74ESIRMcnHxOwoLN0SsyIaDsSEU8lXZL4VHULvXy8Q-NssjVQ9LxY9TV-RcDYedhOY3wBKr2FpBoycNanjw"}],"payload":"{\"payId\":\"payburn_test$payid.mayurbhandary.com\",\"payIdAddress\":{\"paymentNetwork\":\"XRPL\",\"environment\":\"TESTNET\",\"addressDetailsType\":\"CryptoAddressDetails\",\"addressDetails\":{\"address\":\"rU3mTFnefto99VcEECBAbQseRMEKTCLGxr\"}}}"}]};
    const resolved = await payIDClient.validateResolvedPayID('payburn_test$payid.mayurbhandary.com', signed,true);
    console.log('Validated:' + JSON.stringify(resolved));
    const resolved2 = await payIDClient.resolvePayID('payburn_test$payid.mayurbhandary.com', true);
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

