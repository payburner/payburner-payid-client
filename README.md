# payburner-payid-client

Example -- Node:

```
const {PayIDClient, PayIDAddressTypes} = require("@payburner/payburner-payid-client");
const payIDClient = new PayIDClient(true);
const resolvedPayID = await payIDClient.resolvePayID('LaSourceAfrique$payburner.com');
const address = payIDClient.seekAddressOfType(resolvedPayID, new PayIDAddressTypes().XRPL_MAINNET);
```


Example -- Web:

```
    <script src="https://unpkg.com/axios@0.19.2/dist/axios.js"></script>
    <script src="../dist/index.bundle.js"></script>
    <script>
        const payIDClient = new Payburner.PayIDClient(true);
        payIDClient.resolvePayID('LaSourceAfrique$payburner.com').then(function (resolvedPayID) {
            const address = payIDClient.seekAddressOfType(resolvedPayID,
                new Payburner.PayIDAddressTypes().XRPL_MAINNET);
            alert(JSON.stringify(address));
        })
    </script>
```