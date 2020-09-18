
import {Address} from "../interfaces/Address";
import * as jose from "node-jose";

export class ResolvedCryptoAddressWithThumbprint {

    constructor(network: string, environment: string, address: Address, key: jose.JWK.Key, thumbprint: string, thumbprintHex: string, thumbprintMatrix: string[][]) {
        this.network = network;
        this.environment = environment;
        this.address = address;
        this.publicKey = key;
        this.thumbprint = thumbprint;
        this.thumbprintHex = thumbprintHex;
        this.thumbprintMatrix = thumbprintMatrix;
    }
    network: string;
    environment: string;
    address: Address;
    publicKey: jose.JWK.Key;
    thumbprint: string;
    thumbprintHex: string;
    thumbprintMatrix: string[][];

}