
export class PayIDPublicKeyThumbprint {
    constructor(payID: string, thumbprint:string) {
        this.payID = payID;
        this.thumbprint = thumbprint;
    }
    payID: string;
    thumbprint: string;
}