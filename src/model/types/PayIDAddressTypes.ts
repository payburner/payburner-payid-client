import {XrplMainnet} from "./XrplMainnet";
import {PayIDAddressType} from "./PayIDAddressType";
import {XrplDevnet} from "./XrplDevnet";
import {XrplTestnet} from "./XrplTestnet";
import {Ach} from "./Ach";
import {BtcMainnet} from "./BtcMainnet";
import {BtcTestnet} from "./BtcTestnet";
import {EthMainnet} from "./EthMainnet";

export class PayIDAddressTypes {

    XRPL_MAINNET: PayIDAddressType = new XrplMainnet();
    XRPL_TESTNET: PayIDAddressType = new XrplTestnet();
    XRPL_DEVNET: PayIDAddressType = new XrplDevnet();
    ACH: PayIDAddressType = new Ach();
    BTC_MAINNET: PayIDAddressType = new BtcMainnet();
    BTC_TESTNET: PayIDAddressType = new BtcTestnet();
    ETH_MAINNET: PayIDAddressType = new EthMainnet();

    ALL_TYPES: PayIDAddressType[] = [
        this.XRPL_MAINNET, this.XRPL_DEVNET, this.XRPL_TESTNET, this.ACH, this.BTC_MAINNET, this.BTC_TESTNET, this.ETH_MAINNET
    ];
}