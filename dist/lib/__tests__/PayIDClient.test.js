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
import { PayIDClient, PayIDPublicKeyThumbprint } from '../index';
import { XrplMainnet } from "../model/types/XrplMainnet";
import { AddressDetailsType } from "../model/interfaces/AddressDetailsType";
import { PayIDNetworks } from "../model/types/PayIDNetworks";
import { VerifiedPayIDUtils } from "../index";
import { UnsignedPayIDAddressImpl } from "../model/impl/UnsignedPayIDAddressImpl";
var TestLookupService = /** @class */ (function () {
    function TestLookupService() {
        this.payIDThumbprintMap = new Map();
    }
    TestLookupService.prototype.setPayIDThumbprint = function (payID, thumbprint) {
        this.payIDThumbprintMap.set(payID, thumbprint);
    };
    TestLookupService.prototype.resolvePayIDThumbprint = function (payID) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var thumbprint = _this.payIDThumbprintMap.get(payID);
            if (typeof thumbprint !== 'undefined') {
                resolve(new PayIDPublicKeyThumbprint(payID, thumbprint.toString()));
            }
            else {
                reject({ error: 'not found' });
            }
        });
    };
    return TestLookupService;
}());
test('Test resolve XRPL MAINNET', function () { return __awaiter(void 0, void 0, void 0, function () {
    var payIDClient, resolvedPayID, address, addressDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payIDClient = new PayIDClient(true);
                return [4 /*yield*/, payIDClient.resolvePayID('LaSourceAfrique$payburner.com')];
            case 1:
                resolvedPayID = _a.sent();
                address = payIDClient.seekAddressOfType(resolvedPayID, new XrplMainnet());
                expect(address).toBeDefined();
                if (typeof address !== 'undefined') {
                    expect(address.addressDetails).toBeDefined();
                    expect(address.addressDetailsType).toBe(AddressDetailsType.CryptoAddress);
                    addressDetails = address.addressDetails;
                    expect(addressDetails.address).toBeDefined();
                    expect(addressDetails.address).toBe('rKZKRYe6YhskeeDN8YSdPdv6zkMV6LfkR4');
                    expect(address.paymentNetwork).toBe(PayIDNetworks.XRPL);
                    expect(address.environment).toBe(new XrplMainnet().environment);
                }
                return [2 /*return*/];
        }
    });
}); });
test('Test Signing and Verification', function () { return __awaiter(void 0, void 0, void 0, function () {
    var testLookupService, payIDUtils, payIDClient, key, pem, key2, rawPayId, resolvedPayID, address, unsigned, signed, originalThumbprint, verif, verifiedThumbprint, signedPayId, verificationResult, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                testLookupService = new TestLookupService();
                payIDUtils = new VerifiedPayIDUtils();
                payIDClient = new PayIDClient(true, testLookupService);
                return [4 /*yield*/, payIDUtils.newKey()];
            case 1:
                key = _f.sent();
                console.log(key.toJSON(false));
                expect(key.kty).toBe('EC');
                expect(key.length).toBe(256);
                console.log(key.toPEM(false));
                pem = key.toPEM(false);
                return [4 /*yield*/, payIDUtils.fromPEM(pem)];
            case 2:
                key2 = _f.sent();
                console.log(key2.toJSON(false));
                rawPayId = {
                    "payId": "payburn_test$payid.mayurbhandary.com",
                    "addresses": [
                        {
                            "paymentNetwork": "XRPL",
                            "environment": "MAINNET",
                            "addressDetailsType": "CryptoAddressDetails",
                            "addressDetails": {
                                "address": "rU3mTFnefto99VcEECBAbQseRMEKTCLGxr"
                            }
                        }
                    ]
                };
                return [4 /*yield*/, payIDClient.parsePayIDFromData(rawPayId)];
            case 3:
                resolvedPayID = _f.sent();
                address = payIDClient.seekAddressOfType(resolvedPayID, new XrplMainnet());
                unsigned = new UnsignedPayIDAddressImpl(resolvedPayID.payId, address);
                return [4 /*yield*/, payIDUtils.signPayIDAddress(key, unsigned)];
            case 4:
                signed = _f.sent();
                console.log('SIGNED:' + JSON.stringify(signed, null, 2));
                return [4 /*yield*/, key.thumbprint('SHA-256')];
            case 5:
                originalThumbprint = _f.sent();
                return [4 /*yield*/, payIDUtils.verifySignedPayIDAddress(signed)];
            case 6:
                verif = _f.sent();
                return [4 /*yield*/, verif.key.thumbprint('SHA-256')];
            case 7:
                verifiedThumbprint = _f.sent();
                expect(verifiedThumbprint.toString('hex')).toBe(originalThumbprint.toString('hex'));
                return [4 /*yield*/, payIDUtils.signPayID(key, resolvedPayID)];
            case 8:
                signedPayId = _f.sent();
                console.log('SIGNED PAYID:' + JSON.stringify(signedPayId, null, 2));
                console.log('THUMBPRINT:' + verifiedThumbprint.toString('hex'));
                return [4 /*yield*/, payIDUtils.verifyPayID(verifiedThumbprint.toString('hex'), signedPayId)];
            case 9:
                verificationResult = _f.sent();
                console.log('VERIFICATION RESULT:' + JSON.stringify(verificationResult, null, 2));
                testLookupService.setPayIDThumbprint('payburn_test$payid.mayurbhandary.com', originalThumbprint.toString('hex'));
                _b = (_a = console).log;
                _c = 'VALIDATE:';
                _e = (_d = JSON).stringify;
                return [4 /*yield*/, payIDClient.validateResolvedPayID('payburn_test$payid.mayurbhandary.com', signedPayId, true)];
            case 10:
                _b.apply(_a, [_c + _e.apply(_d, [_f.sent(), null, 2])]);
                return [2 /*return*/];
        }
    });
}); });
test('Test parse raw XRPL MAINNET', function () { return __awaiter(void 0, void 0, void 0, function () {
    var payIDClient, rawPayId, resolvedPayID, address, addressDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payIDClient = new PayIDClient(true);
                rawPayId = {
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
                return [4 /*yield*/, payIDClient.parsePayIDFromData(rawPayId)];
            case 1:
                resolvedPayID = _a.sent();
                address = payIDClient.seekAddressOfType(resolvedPayID, new XrplMainnet());
                expect(address).toBeDefined();
                if (typeof address !== 'undefined') {
                    expect(address.addressDetails).toBeDefined();
                    expect(address.addressDetailsType).toBe(AddressDetailsType.CryptoAddress);
                    addressDetails = address.addressDetails;
                    expect(addressDetails.address).toBeDefined();
                    expect(addressDetails.address).toBe('rKZKRYe6YhskeeDN8YSdPdv6zkMV6LfkR4');
                    expect(address.paymentNetwork).toBe(PayIDNetworks.XRPL);
                    expect(address.environment).toBe(new XrplMainnet().environment);
                }
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=PayIDClient.test.js.map