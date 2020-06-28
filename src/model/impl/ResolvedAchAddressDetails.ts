import {AchAddressDetails} from "../interfaces/AchAddressDetails";

export class ResolvedAchAddressDetails implements AchAddressDetails {

    constructor(routingNumber: string, accountNumber:string) {
        this.routingNumber = routingNumber;
        this.accountNumber = accountNumber;
    }
    accountNumber: string;
    routingNumber: string;
}