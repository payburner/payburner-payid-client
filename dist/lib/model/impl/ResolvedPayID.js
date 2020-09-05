var ResolvedPayID = /** @class */ (function () {
    function ResolvedPayID(addresses, payId, memo, proofOfSignature, verifiedAddresses) {
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
        if (typeof verifiedAddresses !== 'undefined') {
            this.verifiedAddresses = verifiedAddresses;
        }
    }
    return ResolvedPayID;
}());
export { ResolvedPayID };
//# sourceMappingURL=ResolvedPayID.js.map