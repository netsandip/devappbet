/**
 * Created by DELL on 4/22/2016.
 */

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var connection = require('./connection');
var cors = require('cors');


//var config = require('./config');
var sportsInterface = require('./betfair/sports.js');
var sports = sportsInterface();

var newsportsInterface = require('./betfair/betfair.js');
var newsports = newsportsInterface();

var userSchema = require('./dbmodels/users');
var UserModel = mongoose.model('usersinfo', userSchema, 'users');

var user_transSchema = require('./dbmodels/user_transaction');
var UserhistoryModel = mongoose.model('users_historyinfo', user_transSchema, 'users_history');

var betSaveInfo = require('./dbmodels/betsave');
var betSaveInfoModel = mongoose.model('betplacementmaster', betSaveInfo, 'betplacementmaster');

var exposureSchema = require('./dbmodels/exposure');
var exposureInfoModel = mongoose.model('exposuremaster',exposureSchema,'exposure');

app.use(cors());
/*app.use(favicon(__dirname + '/public/images/favicon.ico'));*/
app.use(express.static(__dirname + '/public'));
//app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(bodyparser.json());
var ErrorLogInterface = require('./common/errorLogger.js');

mongoose.Promise = require('bluebird');
mongoose.connect(connection.connectionString, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true
  });

//Common functions
var LogError = function(error, moduleName)
{
    let errorlogger = ErrorLogInterface();
    let errorModel = {
      message: error.message,
      modulename: moduleName,
      errorStack: error.errorStack === undefined ?  JSON.stringify(error) : JSON.stringify(error.errorStack)
    }
    errorlogger.logError(errorModel);
}

app.post('/validateLogin', function(req, res)
{	
	UserModel.findOne({userid: req.body.userid, Password: req.body.password },{userid: true, Role: true}, function(err,obj) { 
		console.log(obj); 
		if (obj != undefined) {
			res.json({ "success": true, "errormessage": "", data: obj });
		}
		else
		{
			res.json({ "success": false, "errormessage": "authentication mismatch or user doesnt exists in the system " });
		}		
	
	});
});

app.post('/createUser', function(req, res)
{
	try {
		
		var userdata = req.body;

		var userInfo = new UserModel(userdata);

		UserModel.findOne({userid: userdata.userid}, function(err,obj) { 
			//console.log(obj); 
			if (obj == undefined) {
				userInfo.save(function (err) {
					if (err) {
						LogError(err, "createUser");
						res.status(400).send(err);
					}
					else { res.json({ "success": true, "errormessage": "" }); }
				});	
			}
			else
			{
				res.json({ "success": false, "errormessage": "userid already exists in the system" });
			}		
		
		});        
		
	} catch (error) {
		LogError(error, "createUser");
	}
});


app.post('/getAllUsers', function(req, res)
{
	try {
			
		UserModel.find({Role: "User" },{ Password: false}, function(err,obj) { 
			console.log(obj); 
			if (obj != undefined) {
				res.json({ "success": true, "errormessage": "", data: obj });
			}
			else
			{
				res.json({ "success": false, "errormessage": "authentication mismatch or user doesnt exists in the system" });
			}		
		
		});        
		
	} catch (error) {
		LogError(error, "getAllUsers");
	}
});

app.post('/getUsersHistory', function(req, res)
{
	try {
			
		UserhistoryModel.find({}).sort({"Created_date": -1}).exec(function(err,obj) { 
			console.log(obj); 
			if (obj != undefined) {
				res.json({ "success": true, "errormessage": "", data: obj });
			}
			else
			{
				res.json({ "success": false, "errormessage": "No user history found" });
			}		
		
		});        
		
	} catch (error) {
		LogError(error, "getAllUsers");
	}
});

app.post('/getSportsList', function(req, res)
{
	try {
	    // console.log('Inside sports method');
		sports.getSportsList('4', function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getAuthToken");
		  
			}
			// use response here

			var sportsDetails = response;
			res.json({ "success": true, "errormessage": "", data: sportsDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getSportsList");
	}
});

app.post('/getNewSportsList', function(req, res)
{
	try {
	    // console.log('Inside sports method');
		newsports.getSportsList('4', function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getAuthToken");
		  
			}
			// use response here

			var sportsDetails = response;
			res.json({ "success": true, "errormessage": "", data: sportsDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getSportsList");
	}
});

app.post('/getNewSportsListbySeriesID', function(req, res)
{
	try {
		var seriesid = req.body.seriesId;
	    // console.log(';');
		newsports.getSportsListbySeriesID(seriesid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getSportsListbySeriesID");
		  
			}
			
			var sportsDetails = response;
			res.json({ "success": true, "errormessage": "", data: sportsDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getSportsListbySeriesID");
	}
});


app.post('/getSportsListbySeriesID', function(req, res)
{
	try {
		var seriesid = req.body.seriesId;
	    console.log('Inside sports method');
		sports.getSportsListbySeriesID(seriesid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getSportsListbySeriesID");
		  
			}
			// use response here
			// console.log(response);

			for (let index = 0; index < response.matchfrmApi.length; index++) {
				const element = response.matchfrmApi[index];
				console.log(element.event.name);
				let listofArray = element.event.name.split(' v ');
				console.log(listofArray);
				if (listofArray[1] == undefined) {
					response.matchfrmApi[index].event.name = listofArray[0]
				} else {
					response.matchfrmApi[index].event.name = listofArray[0] + ' v ' + listofArray[1];				
				}
			}
		  
			var sportsDetails = response;
			res.json({ "success": true, "errormessage": "", data: sportsDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getSportsListbySeriesID");
	}
});

app.post('/getMatchListbyMatchID', function(req, res)
{
	try {
		var matchid = req.body.MatchId;
	    sports.getMatchListbyMatchID(matchid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getMatchListbyMatchID");
		  
			}
			// use response here
			//console.log(response);
		  
			var matchDetails = response;
			res.json({ "success": true, "errormessage": "", data: matchDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getMatchListbyMatchID");
	}
});

app.post('/getNewMatchListbyMatchID', function(req, res)
{
	try {
		var matchid = req.body.MatchId;
	    newsports.getMatchListbyMatchID(matchid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getMatchListbyMatchID");
		  
			}
			// use response here
			
		  
			var matchDetails = response;
			res.json({ "success": true, "errormessage": "", data: matchDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getMatchListbyMatchID");
	}
});


app.post('/getMatchOddsbyID', function(req, res)
{
	try {
		var matchid = req.body.MatchId;
		var marketid = req.body.MarketId;
	    sports.getOddsbyMatchID(matchid, marketid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getMatchListbyMatchID");
		  
			}
			// use response here
			//console.log(response.MarketRunner.runners[0]);
		  
			var matchDetails = response;
			if (response.MarketRunner != undefined) {
				res.json({ "success": true, "errormessage": "", data: matchDetails, status: response.MarketRunner.status });				
			} else {
				res.json({ "success": true, "errormessage": "", data: matchDetails, status: "Not Ready" });			
			}
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getMatchListbyMatchID");
	}
});

app.post('/getNewSportsMatchOddsbyID', function(req, res)
{
	try {
		var matchid = req.body.MatchId;
		var marketid = req.body.MarketId;
	    newsports.getOddsbyMarketId(marketid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getNewSportsMatchOddsbyID");
		  
			}
			// use response here
			//console.log(response.MarketRunner.runners[0]);
		  
			var matchDetails = response;
			if (response.MarketRunner != undefined) {
				res.json({ "success": true, "errormessage": "", data: matchDetails, status: response.MarketRunner.status });				
			} else {
				res.json({ "success": true, "errormessage": "", data: matchDetails, status: "Not Ready" });			
			}
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getMatchListbyMatchID");
	}
});


app.post('/saveBetsInfo', function(req, res)
{
	try {
		 var matchid = req.body.MatchId;
		 var marketid = req.body.MarketId;
		 //console.log(req.body);
	    sports.getOddsbyMatchID(matchid, marketid, function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "saveBetsInfo");
		  
			}
			// use response here

			let sports1back;
			let sports2back;
			let sports1lay;
			let sports2lay;

		  
			let matchDetails = response;
			//console.log(matchDetails.MarketRunner);
			sports1back = response.MarketRunner.runners[0].ex.availableToBack[0].price;
			sports1lay = response.MarketRunner.runners[0].ex.availableToLay[0].price;
			sports2back = response.MarketRunner.runners[1].ex.availableToBack[0].price;
			sports2lay = response.MarketRunner.runners[1].ex.availableToLay[0].price;
			//console.log(sports1back + ' ' + sports1lay + ' ' + sports2back + ' ' + sports2lay);

			

			//console.log(req.body);
			var betdata = req.body;
			//console.log(betdata.odds);
			
			// if (sports1back >= betdata.odds || sports2back >= betdata.odds ) {
			// 	betdata.odds = sports1back === undefined ? sports1back : sports2back
			// 	betdata.Status = "Confirmed"
			// } else if (sports1lay < betdata.odds || sports2lay < betdata.odds ) {
			// 	betdata.odds = sports1lay === undefined ? sports1lay : sports2lay
			// 	betdata.Status = "Confirmed"
			// } else 
			// betdata.Status = "Pending"
			

			console.log(betdata);
			var betInfo = new betSaveInfoModel(betdata);

			betInfo.save(function (err) {
				if (err) {
					LogError(err, "saveBetsInfo");
					res.status(400).send(err);
				}
				else { res.json({ "success": true, "errormessage": "" }); }
			});	

			//res.json({ "success": true, "errormessage": "", data: matchDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getMatchListbyMatchID");
	}
});

app.post('/test', function(req, res){
	try {
		var matchid = req.body.MatchId;
		var marketid = req.body.MarketId;
		//console.log(req.body);
	   sports.getOddsbyMatchID(matchid, marketid, function(err, response) {
		   if (err) {
			 // include better error handling here   
			 
			 return LogError(err, "saveBetsInfo");
		 
		   }
		   // use response here

		   let exposureValue = 0;
		   let exposureValue2 = 0;

		   exposureInfoModel.find({}).sort({"Created_date": -1}).limit(1).exec(function(err,obj) { 
			console.log(obj); 
			if (obj != undefined && obj.length > 0) {
				exposureValue = obj[0].exposureValue;
		    	exposureValue2 = obj[0].exposureValue2;
			}
				let sports1back;
		   let sports2back;
		   let sports1lay;
		   let sports2lay;
		   console.log(obj);
		    
		 
		   let matchDetails = response;
		   //console.log(matchDetails.MarketRunner);
		   sports1back = response.MarketRunner.runners[0].ex.availableToBack[0].price;
		   sports1lay = response.MarketRunner.runners[0].ex.availableToLay[0].price;
		   sports2back = response.MarketRunner.runners[1].ex.availableToBack[0].price;
		   sports2lay = response.MarketRunner.runners[1].ex.availableToLay[0].price;
		   
		   var betdata = req.body;
		   let profit = 0;
		   let liability = 0;
		//    console.log('sports1back '+ sports1back, 'sports1lay ' + sports1lay, 'sports2back ' + sports2back, 'sports2lay '+ sports2lay)
		//    console.log(betdata.odds);
		   
		   if ( betdata.back_match_match_lay == 'Back' ) {
			   if (betdata.sportsType === 'sports1' && (parseFloat(sports1back).toFixed(2) >= parseFloat(betdata.odds).toFixed(2))) {
				   console.log('hello1');
				betdata.odds =  sports1back; 
				betdata.liability_profit = (sports1back - 1) * betdata.stakeValue; 
				profit = (sports1back - 1) * betdata.stakeValue; 
				liability = betdata.stakeValue;
				betdata.Status = "Confirmed";  
			   } else if ( betdata.sportsType === 'sports2' && parseFloat(sports2back).toFixed(2) >= parseFloat(betdata.odds).toFixed(2)) {
				betdata.odds =  sports2back;
				console.log('hello2');
				console.log(parseFloat(sports1back).toFixed(2));
				console.log(betdata.stakeValue);
				profit = (parseFloat(sports2back).toFixed(2) - 1) * betdata.stakeValue; 
				liability = betdata.stakeValue;
				betdata.liability_profit = (parseFloat(sports2back).toFixed(2) - 1) * betdata.stakeValue;  
				betdata.Status = "Confirmed" ;
			   } else 			   
			   betdata.Status = "Pending";
		   } else if (betdata.back_match_match_lay == 'Lay' ) {
			   //betdata.odds = sports1lay === undefined ? sports1lay : sports2lay
			   if (betdata.sportsType === 'sports1' && parseFloat(sports1lay).toFixed(2) <= parseFloat(betdata.odds).toFixed(2) ) {
				console.log('hello3');
				profit = betdata.stakeValue;
				liability = (parseFloat(sports1lay).toFixed(2) - 1) * betdata.stakeValue; 
				betdata.odds =  sports1lay; 
				betdata.liability_profit = (parseFloat(sports1lay).toFixed(2) - 1) * betdata.stakeValue;   
				betdata.Status = "Confirmed";
			   } else if (betdata.sportsType === 'sports2' && parseFloat(sports2lay).toFixed(2) <= parseFloat(betdata.odds).toFixed(2)) {
				console.log('hello4');
				profit = betdata.stakeValue;
				liability = (parseFloat(sports2lay).toFixed(2) - 1) * betdata.stakeValue; 
				betdata.odds =  sports2lay;
				betdata.liability_profit = (parseFloat(sports2lay).toFixed(2) - 1) * betdata.stakeValue;   
				betdata.Status = "Confirmed";
			   } else 
			   betdata.Status = "Pending";
		   } else 
		   betdata.Status = "Pending";
		   betdata.liability_profit = parseFloat(betdata.liability_profit).toFixed(2); 
		   		   
		   var betInfo = new betSaveInfoModel(betdata);
		   console.log(profit);
		   console.log(liability);

		   if (betdata.sportsType === 'sports1' && betdata.back_match_match_lay == 'Back' ) {
			   exposureValue = exposureValue + profit;
			   exposureValue2 = exposureValue2 - betdata.stakeValue; //to make negative 
		   } 

		   if (betdata.sportsType === 'sports2' && betdata.back_match_match_lay == 'Back' ) {
				exposureValue = exposureValue - betdata.stakeValue;
				exposureValue2 = exposureValue2 + profit;
		   } 
		   
		   
		   if (betdata.sportsType === 'sports1' && betdata.back_match_match_lay == 'Lay' ) {
				//    console.log(exposureValue);
				//    console.log(profit);
				exposureValue = exposureValue - liability;
				exposureValue2 = exposureValue2 + profit; 
			} 

			if (betdata.sportsType === 'sports2' && betdata.back_match_match_lay == 'Lay' ) {
				exposureValue = exposureValue + profit;
				exposureValue2 = exposureValue2 - liability;
			}

			console.log('exposure1 ' +  exposureValue + ' exposure2 '+ exposureValue2);

		   betInfo.save(function (err) {
			   if (err) {
				   LogError(err, "saveBetsInfo");
				   res.status(400).send(err);
			   }
			   else { 

				if (betdata.Status != "Pending") {
					if (exposureValue > exposureValue2) {
						updateExposure(betdata.userid, exposureValue2, "Deposit");   		
					} else {
						updateExposure(betdata.userid, exposureValue, "Deposit");   	
					}	
				let exposure1 = {
					"userid":betdata.userid,
					"match_name": betdata.match1,
					"MatchId":matchid,
					"MarketId":marketid,
					"exposureValue":exposureValue,
					"exposureValue2":exposureValue2
				}				 
 
				let exposure1info = new exposureInfoModel(exposure1);
				 // let exposure2info = new exposureInfoModel(exposure2);
				exposure1info.save(function (err){
					 if (err) {
						 LogError(err, "Exposure Calculation");				   
					 }
					 
				 });							
				}
							   
				   

				res.json({ "success": true, "errormessage": "" }); 
				 
				}
		   });	

			
			
		
		});        

		   
		   //res.json({ "success": true, "errormessage": "", data: matchDetails });			
		 
		 });
		 
	   
   } catch (error) {
	   LogError(error, "getMatchListbyMatchID");
   }
});


app.post('/getbetsPlacedHistory', function(req, res)
{
	try {
		
		betSaveInfoModel.find({Status: "Confirmed"}).sort({"Created_date": -1}).exec(function(err,obj) { 
		//console.log(obj); 
		if (obj != undefined) {
			res.json({ "success": true, "errormessage": "", data: obj });
		}
		else
		{
			res.json({ "success": false, "errormessage": "No user history found" });
		}		
	
	});        
	
} catch (error) {
	LogError(error, "getAllUsers");
}
});

app.post('/getbetsPlacedHistoryByUserid', function(req, res)
{
	try {
		let userid = req.body.userid;
		betSaveInfoModel.find({ userid: userid, back_match_match_lay: req.body.matchtype, MarketId: req.body.MarketId}).sort({"Created_date": -1}).exec(function(err,obj) { 
		//console.log(obj); 
		if (obj != undefined) {
			res.json({ "success": true, "errormessage": "", data: obj });
		}
		else
		{
			res.json({ "success": false, "errormessage": "No user history found" });
		}		
	
	});        
	
} catch (error) {
	LogError(error, "getAllUsers");
}
});

app.post('/checkBalancebyUserid', function(req, res)
{
	//console.log(req.body);
	UserModel.findOne({userid: req.body.userid}, function(err,obj) { 		
		if (obj != undefined) {
				res.json({ "success": true, "errormessage": "", "balance": obj.Balance , "exposure": obj.UnConfirmed_Balance});								
		}
		else
		{
			res.json({ "success": false, "errormessage": "userid doesnt exists in the system" });
		}	
	
	});	
});

app.post('/cancelByUserID', function(req, res)
{
	//console.log(req.body);
	try {
		let docid = req.body._id;
		betSaveInfoModel.find({ _id: docid}).sort({"Created_date": -1}).exec(function(err,obj) { 
		if (obj != undefined) {
			console.log(obj);
			updateExposure(req.body.userid, obj[0].stakeValue, "Withdraw");
			betSaveInfoModel.remove({ _id: docid }, function (err, events) {
				if (err) {
					console.log(err);
				} else {
					res.json({ "success": "true" });
				}
			});			
		}
		else
		{
			res.json({ "success": false, "errormessage": "No user history found" });
		}		
	
	});        
	
} catch (error) {
	LogError(error, "getAllUsers");
}
	
});

function updateExposure(userid, reqbalance, reqtype)
{

	UserModel.findOne({userid: userid}, function(err,obj) { 
		//console.log(obj); 
		if (obj != undefined) {
			let newBalance;
			if (reqtype == "Deposit") {
				newBalance = reqbalance;//obj.UnConfirmed_Balance + 
			}
			else
			{
				console.log(obj.UnConfirmed_Balance);
				console.log(reqbalance);
				if (obj.UnConfirmed_Balance > 0 && obj.UnConfirmed_Balance >= reqbalance) {
					newBalance = obj.UnConfirmed_Balance - reqbalance;	
				}				
				else
				{					
					//res.json({ "success": false, "errormessage": "In-sufficient balance for userid" });
					return false;
				}
			}
			
			let updateQuery = {
				"$set": {
					'UnConfirmed_Balance': newBalance
				}
			};
		
			UserModel.findOneAndUpdate({userid: userid}, updateQuery, function(err, doc){
				if(err){
					LogError(err, "UpdateDeposit");
				}
				// let userhistorydata = {
				// 	"userid" : userid,
				// 	"Balance" : reqbalance,
				// 	"Balance_Type": reqtype
				// }
				// let userHistoryInfo = new UserhistoryModel(userhistorydata);
				// userHistoryInfo.save(function (err) {
				// 	if (err) {
				// 		LogError(err, "UpdateDeposit_history_save");						
				// 	}
					
				// });	
			
				//res.json({ "success": true, "errormessage": "" });
			});						
		}
		else
		{
			//res.json({ "success": false, "errormessage": "userid doesnt exists in the system" });
		}
	});
}


app.post('/UpdateDeposit', function(req, res)
{
	// console.log(req.body);		
	UserModel.findOne({userid: req.body.userid}, function(err,obj) { 
		//console.log(obj); 
		if (obj != undefined) {
			let newBalance;
			if (req.body.reqtype == "Deposit") {
				newBalance = obj.Balance + req.body.reqbalance;
			}
			else
			{
				if (obj.Balance > 0 && obj.Balance >= req.body.reqbalance) {
					newBalance = obj.Balance - req.body.reqbalance;	
				}				
				else
				{					
					res.json({ "success": false, "errormessage": "In-sufficient balance for userid" });
					return false;
				}
			}
			
			let updateQuery = {
				"$set": {
					'Balance': newBalance
				}
			};
		
			UserModel.findOneAndUpdate({userid: req.body.userid}, updateQuery, function(err, doc){
				if(err){
					LogError(err, "UpdateDeposit");
				}
				let userhistorydata = {
					"userid" : req.body.userid,
					"Balance" : req.body.reqbalance,
					"Balance_Type": req.body.reqtype
				}
				let userHistoryInfo = new UserhistoryModel(userhistorydata);
				userHistoryInfo.save(function (err) {
					if (err) {
						LogError(err, "UpdateDeposit_history_save");						
					}
					
				});	
			
				res.json({ "success": true, "errormessage": "" });
			});						
		}
		else
		{
			res.json({ "success": false, "errormessage": "userid doesnt exists in the system" });
		}	
	
	});		
});


var Port = process.env.PORT || 3000;
app.listen(Port);
console.log("server running on port " + Port);