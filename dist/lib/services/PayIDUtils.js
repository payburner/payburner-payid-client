import * as jose from 'node-jose';
import { UnsignedPayIDAddressImpl } from "../model/impl/UnsignedPayIDAddressImpl";
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
var PayIDUtils = /** @class */ (function () {
    function PayIDUtils() {
    }
    PayIDUtils.prototype.newKeyStore = function () {
        return jose.JWK.createKeyStore();
    };
    PayIDUtils.prototype.newKey = function () {
        return this.newKeyStore().generate("RSA", 2048, { alg: "RS512", key_ops: ["sign", "decrypt", "unwrap"] });
    };
    PayIDUtils.prototype.fromPEM = function (pem) {
        return jose.JWK.createKeyStore().add(pem, 'pem');
    };
    PayIDUtils.prototype.signPayID = function (key, input) {
        var self = this;
        var promises = new Array();
        input.addresses.forEach(function (address) {
            var unsigned = new UnsignedPayIDAddressImpl(input.payId, address);
            promises.push(self.signPayIDAddress(key, unsigned));
        });
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function (values) {
                resolve(new ResolvedPayID(input.addresses, input.payId, input.memo, input.proofOfControlSignature, values));
            });
        });
    };
    PayIDUtils.prototype.verifySignedPayIDAddress = function (input) {
        return jose.JWS.createVerify().verify(input, {
            allowEmbeddedKey: true,
            handlers: {
                name: true
            }
        });
    };
    PayIDUtils.prototype.signPayIDAddress = function (key, input) {
        var opts = {
            compact: false,
            fields: {
                name: 'identityKey',
                alg: 'RS512',
                typ: 'JOSE+JSON',
                crit: ['name']
            },
            handlers: {
                name: true
            }
        };
        return new Promise(function (resolve, reject) {
            jose.JWS.createSign(opts, {
                key: key,
                reference: "jwk"
            }).update(JSON.stringify(input), "utf-8").final().then(function (signed) {
                var unknownData = signed;
                resolve(unknownData);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    return PayIDUtils;
}());
export { PayIDUtils };
//# sourceMappingURL=PayIDUtils.js.map