import { PayIDSignature } from "./PayIDSignature";
export interface SignedPayIDAddress {
    payload: string;
    signatures: PayIDSignature[];
}
