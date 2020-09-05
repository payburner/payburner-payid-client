import { ParsedPayID } from '../model/ParsedPayID';
import { ResolvedPayID } from "../model/impl/ResolvedPayID";
import { Address } from "../model/interfaces/Address";
import { PayIDAddressType } from "../model/types/PayIDAddressType";
import { PayIDAddressTypes } from "../model/types/PayIDAddressTypes";
import { PayIDHeader } from "../model/types/PayIDHeader";
import { PayIDThumbprintLookupService } from "./PayIDThumbprintLookupService";
import { VerifiedPayIDUtils } from "./VerifiedPayIDUtils";
export declare class PayIDClient {
    constructor(tolerant?: boolean, payIDThumbprintServiceLookup?: PayIDThumbprintLookupService);
    payIDThumbprintServiceLookup?: PayIDThumbprintLookupService;
    verifiedPayIDUtils: VerifiedPayIDUtils;
    tolerant: boolean;
    isASCII(input: string): boolean;
    parsePayIDUri(payId: string): ParsedPayID | undefined;
    resolveRawPayID(payID: string, payIDHeader?: PayIDHeader): Promise<any>;
    parsePayIDFromData(data: any): Promise<ResolvedPayID>;
    validateResolvedPayID(payID: string, data: ResolvedPayID, verify: boolean): Promise<ResolvedPayID>;
    resolvePayID(payID: string, verify?: boolean): Promise<ResolvedPayID>;
    seekAddressOfType(resolvedPayID: ResolvedPayID, payIdAddressType: PayIDAddressType): Address | undefined;
    getPayIDAddressTypes(): PayIDAddressTypes;
}
