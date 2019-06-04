// Script for airdroppin tokens (not TRX) based on SR votes (ratio can be configured)
// Private key for wallet defined in 'air_address' has to be stored as an environment var (at the level of OS) 
/************************** Command line  USAGE    *******************************/
/*  
Change 'air_address' to whatever is the address containing the tokens to be airdropped
Also change 'token_id' to your own token
Then execute the next command line instruction:

                           node tronair.js file.json

where file.json is a JSON file looking like this..
	
	{ "list":  [
			{"address" : "TXBnjY7CAq39Jj748XLfLd97tXGyknwD1x" , "amount" : 2004538},
			{"address" : "TQ5qpcvtruNdYwokc3JHGb6dzuYMbam485" , "amount" : 1788121},
			{"address" : "TUvV7VFJuj4wcd2ny3ZT3rZXivGpmhWoDV" , "amount" : 1473256},
			{"address" : "TAh4zm9ULixhuCauikkaBjNCgnDptX5bW5" , "amount" : 1  }  
			]
	}
*********************************************************************************/
/************************** CONFIGURATION AREA **********************************/
//var filename = 'votes_TDGy_2019_02_10at22_20_DONE.json'; 
//Obsolete:
//var candidate = "TDGy2M9qWBepSHDEutWWxWd1JZfmAed3BP"; //SR/candidate address from whom we want the votes details 
//var air_address = "TNtPJVFFGWYRYXUaa1XJhW6MCoNQzW1nkk"; //address containing the tokens to be airdropped
//var token_id = '1000322'; //'1000322' = CommunityNodeToken  '1000562' HELP, 1001953 = SmartRealState (REAL)
/************************** END CONFIGURATION *******************************/

var aux = 	{ "list":  [
	{"address" : "TXBnjY7CAq39Jj748XLfLd97tXGyknwD1x" , "amount" : 1},
	{"address" : "TQ2DEExQXEgpQXCzqDZeUbViFy94HSuhrx" , "amount" : 2},
	{"address" : "TUvV7VFJuj4wcd2ny3ZT3rZXivGpmhWoDV" , "amount" : 3},
	{"address" : "TNtPJVFFGWYRYXUaa1XJhW6MCoNQzW1nkk" , "amount" : 4}

	]
};
/*
const fs = require('fs');

var filename = process.argv[2];
var test = process.argv[3];
var voters = require("./" + filename ); //load the file
var failures = [];
*/
var tw; //tronWeb

/* async function sendToken(wallet, isToken, test){
	var tx;
	if(test){
		console.log(air_address, voter.address, voter.reward);
	}else{
		//tx = await client.transferAsset( process.env.PK, token_id, air_address, voter.address, voter.votes,'');
		//trx
		tx = await client.createTransaction(process.env.PK, air_address, voter.address, voter.reward, '');
		
		if(!tx.result) { 
			failures.push(voter); 
			console.log("FAILURE: " + tx.transaction.toAddress + " - " + tx.transaction.amount + " tokens "); // result 	
		}else{
			console.log("SUCCESS: " + tx.transaction.toAddress + " - " + tx.transaction.amount + " tokens "); // result 	
		}	
	}
 }
 */ 

async function doAirdrop(tronWeb, airdrop, test){
	var air_test = {};
	//After dividing rewards by targets, some targets may have ended up receiving a few cents , dropped by Math.floor()
    //TODO: store this into SQLite    For now, remove them from the final list to avoid invoking API with 0 amount
	//airdrop.list = sqliteZeroAmounts(airdrop.list);
//TENER EN CUENTA LA PRECISION para decidir si se ha de quitar o no

	//if(airdrop.list.length >= 1){ //i.d: airdropping to little tokens (ie:500) amongst 1000 wallets would generate list.length = 0 !!
	//	air_test.msg = "";
		if(airdrop.isToken){
			air_test = await doAirdropToken(tronWeb, airdrop, true); //TRX
		}else{
			air_test = await doAirdropTRX(tronWeb, airdrop, true); //TOKENS
		} 
	//}else{
	//	var msg = "Trying to EQUALLY airdrop too little tokens amongst too many wallets causes all wallets receive 0.xxx";
	//	air_test = {success: [], failures: [], msg: msg};
	//}
	return air_test;
}

//For TRX
async function doAirdropTRX(tronWeb, airdrop, test){  //WARNING: test not implemented!!
	tw = tronWeb;
	console.log("* * * tronair-cli  * *  * COMMUNITY NODE aidrop tool * * *");
	console.log("* * * Airdropping \x1b[96m" + airdrop.token_name + "\x1b[97m (\x1b[96m" + airdrop.token_abbr + "\x1b[97m) to " + airdrop.list.length + " wallets");
	var msg = (test)?"\t\t#### Running on test mode - NO AIRDROP #####":""; 
	//console.log(msg);
	if(airdrop.test) airdrop.list = aux.list;
	
	var success = [];
	var failures = [];
	var all = Promise.all(airdrop.list.map(wallet => //sendTrx callback behaviour: https://github.com/tronprotocol/tron-web/blob/2.1.5/src/lib/trx.js#L686
	   	 	tronWeb.trx.sendTrx(wallet.address, wallet.amount, function (xnul, res){     //closures mantain 'target' value
    				    if(xnul != null){ //err
                    		wallet.msg = xnul;
                            wallet.ok = false;
							wallet.tx = "";
							failures.push(wallet);
                        }else{
                            wallet.ok = res.result; //some kind of error may also have happen
                			if(res.result){ //all ok
                                wallet.msg = "SUCCESS";
                                wallet.tx = res.transaction.txID;
                            }else{
                        	    wallet.msg = "Something happened: " + JSON.stringify(res);
                                wallet.tx = ""; //no succesful tx
							}
							success.push(wallet);
                        }
                        //console.log((wallet.ok?"true ":"false") + " " + wallet.address + " " + wallet.amount + " reason: " + (wallet.ok?wallet.tx:wallet.msg));
                        return wallet;
        	}) //closure 
    	)//map
		).then(data => {  //separate into SUCCESS and others
			var success = [];
			var failures = [];
			data.forEach( tx => {
				if(tx.msg == "SUCCESS"){
					success.push(tx);
				}else{
					failures.push(tx);
				}
			});
			return {success: success, failures: failures};
		});
		return all;
}
	
async function doAirdropToken(tronWeb, airdrop, test){//TOKENS
	tw = tronWeb;
    
	console.log("* * * tronair-cli  * *  * COMMUNITY	 NODE aidrop tool * * *");
	console.log("* * * Airdropping \x1b[96m" + airdrop.token_name + "\x1b[97m (\x1b[96m" + airdrop.token_abbr + "\x1b[97m) to " + airdrop.list.length + " wallets");
	var msg = (test)?"\t\t#### Running on test mode - NO AIRDROP #####":""; 
	//console.log(msg);
	if(airdrop.test) airdrop.list = aux.list;

	var success = [];
	var failures = [];
	var all = Promise.all(airdrop.list.map(wallet => //sendTrx callback behaviour: https://github.com/tronprotocol/tron-web/blob/2.1.5/src/lib/trx.js#L686
    		tronWeb.trx.sendToken(wallet.address, wallet.amount, airdrop.token_id, function (xnul, res){     //closures mantain 'target' value
                        if(xnul != null){ //err
                            wallet.msg = xnul;
                            wallet.ok = false;
                            wallet.tx = "";
							failures.push(wallet);
						}else{
                            wallet.ok = res.result; //some kind of error may also have happen
                            if(res.result){ //all ok
                                wallet.msg = "SUCCESS";
                                wallet.tx = res.transaction.txID;
                            }else{
                                wallet.msg = "Something happened: " + JSON.stringify(res);
                                wallet.tx = ""; //no succesful tx
							}
							success.push(wallet);
                        }
                        //console.log((wallet.ok?"true ":"false") + " " + wallet.address + " " + wallet.amount + " reason: " + (wallet.ok?wallet.tx:wallet.msg));
                        return wallet;
            }) //closure 
        )//map
	).then(data => {  //separate into SUCCESS and others
		var success = [];
		var failures = [];
		data.forEach( tx => {
			if(tx.msg == "SUCCESS"){
				success.push(tx);
			}else{
				failures.push(tx);
			}
		});
		return {success: success, failures: failures};
	});
	return all;
}

function sqliteZeroAmounts(arr){
	console.log("Removing targets with infinitesimal amounts..");
	var counter = 0;
	var aux = arr.filter(x => {
		if(x.amount <1) process.stdout.write("\x1b[96m\r" + (counter++) + ": Removing " + x.address + "\x1b[97m\r");
		return x.amount > 1;
	})
	console.log("");

	return aux;
}

module.exports.doAirdrop = doAirdrop;
module.exports.sqliteZeroAmounts = sqliteZeroAmounts;

