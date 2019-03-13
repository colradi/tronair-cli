/*AIRDROP object example: (as declared in ./menu.js) 
{ trx: false,
  token_name: 'CommunityNodeToken',
  token_abbr: 'TRUC',
  token_id: '1000322',
  token_precision: 0,
  token_balance: 35000, //balance of the airdropper account (either for TRX or for TOKEN)
  amount: '3500000',
  criteria: ( CRITERIAS.VOTERS_PROPORTIONAL | CRITERIAS.VOTERS_EQUAL | CRITERIAS.HOLDERS | CRITERIAS.CSV) 
  SR_address: 'TDGy2M9qWBepSHDEutWWxWd1JZfmAed3BP',
  SR_name: 'CommunityNode' 
}

*/
var rp = require("request-promise")

const votes_url = "https://apilist.tronscan.org/api/vote";
/* configuration options for request-promise library */
var votes_options = {
    uri: votes_url,
    qs: {
        candidate: "TDGy2M9qWBepSHDEutWWxWd1JZfmAed3BP", // -> uri + '?access_token=xxxxx%20xxxxx'
		start: 0,
		limit: 40,
		sort: "-votes" 
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

/**
 *  Returns voters data for a gives SR/candidate 
 *
 * @param {*} aidrop A JS object containing all the airdrop configuration
 * @returns A json containing a "data" array with all the <voters,amount> for the given @airdrop
 */
async function getVoters(airdrop){
	votes_options.qs.candidate = airdrop.SR_address;
	return rp(votes_options).catch(function (err) {//download the first page..
		console.log(" Error getting voters list from " + votes_url ) ;
	}).then(page => { //..to find out how many voters
		airdrop.SR_votersCount = page.total;
		airdrop.SR_votesCount = page.totalVotes; //we already had that value from 'menu.js' but may have changed, so better update
		var numPages = Math.floor(page.total / 40);
		var promises = [];
		for(var i = 1 ; i<=numPages; i++){ 
			votes_options.qs.start = i*40; // prepare paginations: 40, 80, 120, 160, ..
			promises.push(rp(votes_options)); //request paginated pages
		} 

		return Promise.all(promises).then(function(otherPages) {
			//Merge all 'otherPages' with the first 'page' (result lies in 'page') 
			otherPages.forEach(nextPage => {    Array.prototype.push.apply(page.data, nextPage.data); } );
			return page; //REMEMBER: Array.prototype.push.apply MODIFIES ¡page!
		})
		.catch(function(err) {
			console.log(" Error getting voters list from " + votes_url ) ;
		})
		.then(function(allPages) {  
			airdrop["SR_total_votes"] = allPages.totalVotes;
			var voters = allPages.data;
			airdrop["SR_total_votes_filtered"] = 0; //Discard airdrop.SR_votesCount, since now we may (*)REMOVE some voters depending on user desires
			var testing_sum = 0;
			
			//(*)REMOVE voters depending on their number of votes (default: remove 0 votes voters)
			//console.log("DEBUG: Remove voters with less than " + airdrop.votes_threshold + "? " +  airdrop.remove_voters_with_THRESHOLD_votes);
			//process.stdout.write("DEBUG: From number-of-voters: " + voters.length + " ... ");
			if(airdrop.remove_voters_with_THRESHOLD_votes){
				voters = voters.filter(voter => { 
					if(voter.votes > airdrop.votes_threshold) { airdrop["SR_total_votes_filtered"] += voter.votes; }
					return (voter.votes > airdrop.votes_threshold); }); 
			}
			console.log("...to number-of-voters: " + voters.length + " after removing voters with votes > " + airdrop.votes_threshold );
			airdrop["num_wallets_filtered"] = voters.length;

			var arrTargets;
			//Adjust rewards amount according to SUBCRITERIAS and trim out the relevant information:
			switch (airdrop.criteria){
				case airdrop.CRITERIAS.VOTERS_PROPORTIONAL:
					console.log("\nairdrop.amount: " + airdrop.amount)
					console.log("SR_total_votes_filtered: " + airdrop.SR_total_votes_filtered);
					var reward_per_vote =  airdrop.amount / airdrop.SR_total_votes_filtered; 
					console.log("reward per vote: " + reward_per_vote)
					arrTargets = voters.map( voter => {
						var reward = voter.votes*reward_per_vote;
						var amount = reward * Math.pow(10, airdrop.token_precision); 
						amount = Math.floor(amount);//discard the decimals
						//console.log(airdrop.token_precision + " >>> " + voter.voterAddress + " reward: " + reward + " amount: " + amount);
						testing_sum += amount;
						return {address: voter.voterAddress, amount: amount}; 
					}); 
					break;
				case airdrop.CRITERIAS.VOTERS_EQUAL:
					var reward = airdrop.amount / airdrop.num_wallets_filtered;
					var amount = reward * Math.pow(10, airdrop.token_precision); 
					amount = Math.floor(amount);//discard the decimals
					arrTargets = voters.map( voter => { 
						testing_sum += amount;
						return {address: voter.voterAddress, amount: amount}; 
					});
					break;
				//case airdrop.CRITERIAS.HOLDERS:
				//case Add here new CRITERIAS: ...
			}
			//DEBUG console.log(testing_sum);
			return arrTargets;
		});
 	} )
}

module.exports.getVoters = getVoters;
