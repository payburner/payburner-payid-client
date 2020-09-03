import * as jose from 'node-jose';
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
    PayIDUtils.prototype.verify = function (input) {
        return jose.JWS.createVerify().
            verify(input, { allowEmbeddedKey: true,
            handlers: {
                name: true
            } });
    };
    PayIDUtils.prototype.sign = function (key, input) {
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
        return jose.JWS.createSign(opts, {
            key: key,
            reference: "jwk"
        }).
            update(JSON.stringify(input), "utf-8").
            final();
    };
    return PayIDUtils;
}());
export { PayIDUtils };
//# sourceMappingURL=PayIDUtils.js.map