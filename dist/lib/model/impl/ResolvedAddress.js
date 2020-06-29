var ResolvedAddress = /** @class */ (function () {
    function ResolvedAddress(addressDetails, addressDetailsType, network, environment) {
        this.addressDetails = addressDetails;
        if (typeof environment !== undefined) {
            this.environment = environment;
        }
        this.paymentNetwork = network;
        this.addressDetailsType = addressDetailsType;
    }
    return ResolvedAddress;
}());
export { ResolvedAddress };
//# sourceMappingURL=ResolvedAddress.js.map