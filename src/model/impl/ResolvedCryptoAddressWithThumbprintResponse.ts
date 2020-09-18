
import {ResolvedCryptoAddressWithThumbprint} from "./ResolvedCryptoAddressWithThumbprint";

export class ResolvedCryptoAddressWithThumbprintResponse {

    constructor(response?: ResolvedCryptoAddressWithThumbprint) {
        if (typeof response !== 'undefined') {
            this.response = response;
        }
    }
    response?: ResolvedCryptoAddressWithThumbprint;


}