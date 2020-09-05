import { VerificationErrorCode } from "../interfaces/VerificationErrorCode";
export declare class VerificationResult {
    constructor(verified: boolean, errorCode?: VerificationErrorCode, errorMessage?: string);
    verified: boolean;
    errorCode?: VerificationErrorCode;
    errorMessage?: string;
}
