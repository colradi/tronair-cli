# tronair-cli <img src="img/tronair-cli.png" width="200" align="center">
The ultimate command-line airdrop tool for the Tron blockchain

`mkdir test_tronair`

`cd test_tronair`

`npm init`   //accept default options..

`npm install tronair-cli`

You need to declare an _environment variable_ (at the level of OS) called **PK** containing the private key of the wallet from which you will perform the airdrop.

In the case you create a specific wallet only for airdropping porpouses, keep in mind you will need _Tron blockchain bandwidth_ or you will pay all the transactions with TRX: A single transfer is ~200 bytes, so it costs 200 Sun (0.002 TRX). Airdropping to 10k addresses would cost 20 TRX.

Create a file **index.js** in test_tronair directory with this contents:
```
var tronair = require("tronair-cli");
var m = tronair.start();
```

##Execution
`node index.js`
