import { PayIDPublicKeyThumbprint } from "../model/impl/PayIDPublicKeyThumbprint";
export interface PayIDThumbprintLookupService {
    resolvePayIDThumbprint(payID: string): Promise<PayIDPublicKeyThumbprint>;
}
