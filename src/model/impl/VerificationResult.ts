import {VerificationErrorCode} from "../interfaces/VerificationErrorCode";

export class VerificationResult {

    constructor(verified:boolean, errorCode?:VerificationErrorCode, errorMessage?:string) {
        this.verified = verified;
        if (typeof errorCode !== 'undefined') {
            this.errorCode = errorCode;
        }
        if (typeof errorMessage !== 'undefined') {
            this.errorMessage = errorMessage;
        }

    }

    verified: boolean;
    errorCode?: VerificationErrorCode;
    errorMessage?: string;


}