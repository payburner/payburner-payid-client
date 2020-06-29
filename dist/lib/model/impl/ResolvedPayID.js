var ResolvedPayID = /** @class */ (function () {
    function ResolvedPayID(addresses, payId, memo, proofOfSignature) {
        this.addresses = addresses;
        if (typeof payId !== 'undefined') {
            this.payId = payId;
        }
        if (typeof memo !== 'undefined') {
            this.memo = memo;
        }
        if (typeof proofOfSignature !== 'undefined') {
            this.proofOfControlSignature = proofOfSignature;
        }
    }
    return ResolvedPayID;
}());
export { ResolvedPayID };
//# sourceMappingURL=ResolvedPayID.js.map