import * as jose from 'node-jose';

export class PayIDUtils {

    constructor() {

    }

    newKeyStore() : jose.JWK.KeyStore {
        return jose.JWK.createKeyStore();
    }

    newKey() : Promise<jose.JWK.Key> {
        return this.newKeyStore().generate("RSA",2048,{alg:"RS512", key_ops:["sign", "decrypt", "unwrap"]});
    }

    fromPEM( pem: string ) : Promise<jose.JWK.Key> {
        return jose.JWK.createKeyStore().add(pem, 'pem');
    }

    verify( input: any ) : Promise<any> {

        return jose.JWS.createVerify().
        verify(input, { allowEmbeddedKey: true,
            handlers: {
            name: true
        }});
    }

    sign( key: jose.JWK.Key, input: any) : Promise<any> {
        var opts = {
            compact:false,
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
    }
}