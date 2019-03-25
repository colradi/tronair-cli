# tronair-cli <img src="img/tronair-cli.png" width="200" align="center"> 
The ultimate command-line airdrop tool for the Tron blockchain, by Community Node SR

## Installation
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

## Execution
**tronair-cli** can run both ways, with or without human interaction 
### - Human attended
Just run 
`node index.js`
and this will start a promt that will ask all the details about your airdrop preferences (what token are you going to airdrop, the amount, to whom are you airdropping, etc)
<p align="center">
<img src="img/human.png" align="center">
</p>
and this will start a promt that will ask all the details about your airdrop preferences (what token are you going to airdrop, the amount, to whom are you airdropping, etc)

### - Human un-attended
If you need, let's say, to _cron schedule_ your airdrops, the you can just pass the airdrop arguments in the command line:

This is a list of the command line options:
```
-h, --help              Shows this help
-a, --amount  number    Amount to be airdropped (your wallet balance should have at least that amount) (ie: 1000322)
-i, --tokenID number    The id of the token to airdrop (ie: 1000322)
-v, --voters  string    Airdrop goes to wallets voting this SR/candidate address (ie: TDGy2M9qWBepSHDEutWWxWd1JZfmAed3BP)
-o, --holders number    Airdrop goes to wallets holding token with this id (ie: 1002000)
-e, --equal             The rewards will equally divided among all holders/voters
-p, --proportional      The rewards will be proportionally divided based on number of votes/holdings

```
## Results
Airdropping involves lots of transactions, and sometimes things can go wrong.
In bot cases (attended or un-attended), tronair will generate a json file for SUCCESS and FAILED transactions

`SUCCESS_9999_TRUC_2019_03_25at19_11_33.json` (and `FAILED_9999_TRUC_2019_03_25at19_11_33.json`
 containing the failed transactions)

where 9999 is the airdropped amount, along with the date and time.

//TODO: Feed tronair-cli with FAILED files. 

## Credits
Find us on Telegram:
https://t.me/CommunityNode
