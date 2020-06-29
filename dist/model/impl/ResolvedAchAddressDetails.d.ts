import { AchAddressDetails } from "../interfaces/AchAddressDetails";
export declare class ResolvedAchAddressDetails implements AchAddressDetails {
    constructor(routingNumber: string, accountNumber: string);
    accountNumber: string;
    routingNumber: string;
}
