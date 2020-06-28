/**
 * This is a derivative work of https://github.com/payid-org/payid/blob/master/src/config.ts
 */

export class ParsedPayID {
    constructor(host: string, path: string) {
        this.host = host;
        this.path = path;
    }

    host: string;
    path: string;
}
