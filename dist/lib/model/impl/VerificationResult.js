var VerificationResult = /** @class */ (function () {
    function VerificationResult(verified, errorCode, errorMessage) {
        this.verified = verified;
        if (typeof errorCode !== 'undefined') {
            this.errorCode = errorCode;
        }
        if (typeof errorMessage !== 'undefined') {
            this.errorMessage = errorMessage;
        }
    }
    return VerificationResult;
}());
export { VerificationResult };
//# sourceMappingURL=VerificationResult.js.map