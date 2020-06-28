# payburner-payid-client

Example:

```const {PayIDClient, PayIDAddressTypes} = require("@payburner/payburner-payid-client");
const payIDClient = new PayIDClient(true);
const resolvedPayID = await payIDClient.resolvePayID('LaSourceAfrique$payburner.com');
const address = payIDClient.seekAddressOfType(resolvedPayID, new PayIDAddressTypes().XRPL_MAINNET);```
