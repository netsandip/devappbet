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

var userSchema = require('./dbmodels/users');
var UserModel = mongoose.model('usersinfo', userSchema, 'users');

var user_transSchema = require('./dbmodels/user_transaction');
var UserhistoryModel = mongoose.model('users_historyinfo', user_transSchema, 'users_history');
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
    useMongoClient: true
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
	    console.log('Inside sports method');
		sports.getSportsList('4', function(err, response) {
			if (err) {
			  // include better error handling here   
			  
			  return LogError(err, "getAuthToken");
		  
			}
			// use response here
			//console.log(response);
		  
			var sportsDetails = response;
			res.json({ "success": true, "errormessage": "", data: sportsDetails });			
		  
		  });
		  
		
	} catch (error) {
		LogError(error, "getSportsList");
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
			//console.log(response);
		  
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




app.post('/UpdateDeposit', function(req, res)
{
	console.log(req.body);		
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