# tronair-cli
The ultimate command-line airdrop tool for the Tron blockchain

(please keep in mind now this version runs **human-attended** on the command line. Next update will run also unattended, so you could cron-schedule it and the so..)

`mkdir test_tronair`

`cd test_tronair`

`npm init`   //accept default options..

`npm install tronair`

Create a file **index.js** in test_tronair directory with this contents:
```
var air = require("tronair");

async function start(){
  var m = await air.main();
}
```

And just execute:
`node index.js`
