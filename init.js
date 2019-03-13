/*
The list of airdrop targets should have this format:
{ "data" :
   [ 
       { address: "T5Jh32mxV89EW5BM12DOpe42PhH", reward: 23 },
       { address: "...........................", reward: 32234 },
    ]
}
*/
const TronWeb = require('tronweb');
const privateKey = process.env.PK;
const reports = require("./reports.js");

const tronWeb = new TronWeb(
'https://api.trongrid.io',
'https://api.trongrid.io',
'https://api.trongrid.io',
privateKey,
);

var menu = require("./menu.js");
var tronair = require("./tronair.js");

async function main(test){
    var airdrop = await menu.collectData(tronWeb); //Collect airdrop info
    airdrop.test = test;
    var list; 
    switch(airdrop.criteria){
    case airdrop.CRITERIAS.VOTERS_PROPORTIONAL:
    case airdrop.CRITERIAS.VOTERS_EQUAL:
        var sr = require("./voters.js");
        list = await sr.getVoters(airdrop);
        break;
    case airdrop.CRITERIAS.HOLDERS_PROPORTIONAL:
        var token2 = require("./holders.js");
        list = await token2.getHolders(airdrop);
        break;
    case airdrop.CRITERIAS.HOLDERS_EQUAL:
        var token2 = require("./holders.js");
        list = await token2.getHolders(airdrop);
        break;
    case airdrop.CRITERIAS.CSV:
       // var fileManager = require("./csv.js");
        //list = await fileManager.getList(airdrop);
        break;
    }
    
    
    console.log( JSON.stringify(list));
    console.log( {airdrop});
    airdrop.list = list;
    
    var yes = await reports.confirmBefore(tronWeb, airdrop);
    console.log( "proceed? " + yes );
    if(yes){ //THE ACTUAL AIRDROP HAPPENS HERE!!!!
        var air_results = await tronair.doAirdrop(tronWeb, airdrop, true);
        reports.explainResults(airdrop, air_results);
        //console.log({air_results});
    }
    return airdrop;
}


module.exports.main = main;

var test = false; 
var m = main(test);
