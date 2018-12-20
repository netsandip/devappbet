
var schedule = require('node-schedule');
var mongoose = require('mongoose');
var connection = require('../connection');
var betSaveInfo = require('../dbmodels/betsave');
var betSaveInfoModel = mongoose.model('betplacementmaster', betSaveInfo, 'betplacementmaster');

var userSchema = require('../dbmodels/users');
var UserModel = mongoose.model('usersinfo', userSchema, 'users');

var exposureSchema = require('../dbmodels/exposure');
var exposureInfoModel = mongoose.model('exposuremaster',exposureSchema,'exposure');

var sportsInterface = require('../betfair/sports.js');
var sports = sportsInterface();

mongoose.Promise = require('bluebird');
mongoose.connect(connection.connectionString, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true
  });


let updateRecordsWithValue = function (params) {
    
}

var j = schedule.scheduleJob('*/15 * * * * *', function() {     

    console.log('** Pending Wager is Running **');
    betSaveInfoModel.find({Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,obj) { 
        // console.log(obj);   
        if(err)
        console.log(err);
        for (let index = 0; index < obj.length; index++) {
            const element = obj[index];

            sports.getOddsbyMatchID(element.MatchId, element.MarketId, function(err, response) {
                if (err) {
                  // include better error handling here   
                  
                  return LogError(err, "getMatchListbyMatchID");
              
                }
                // use response here
                

                if (response.MarketRunner.runners[0].status == 'WINNER') {
                    console.log(response.MarketRunner.runners[0].selectionId);    
                    sports.getSelectionNames(element.MarketId, function(err, response) {
                        if (response.length > 0) {
                            console.log(response.runners);
                        }
                    });
                    
                }


                if (response.MarketRunner.runners[0].status != 'LOSER' && response.MarketRunner.runners[0].ex.availableToBack != undefined ) {
                    let backprice = parseFloat(response.MarketRunner.runners[0].ex.availableToBack[0].price).toFixed(2);
                    let layprice = parseFloat(response.MarketRunner.runners[0].ex.availableToLay[0].price).toFixed(2);
                    let backpricespt2 = parseFloat(response.MarketRunner.runners[1].ex.availableToBack[0].price).toFixed(2);
                    let laypricespt2 = parseFloat(response.MarketRunner.runners[1].ex.availableToLay[0].price).toFixed(2);
                    console.log(backprice);
                    betSaveInfoModel.find({ "odds":{"$lte":backprice}, back_match_match_lay:"Back",  Status: "Pending", "sportsType" : "sports1"}).sort({"Created_date": -1}).exec(function(err,objBack) {
                        if (err) {
                            // include better error handling here                               
                            return LogError(err, "getMatchListbyMatchID");                        
                          }         
                          if (objBack.length > 0 ) {
                            //console.log(objBack);    

                            let updateQuery = {
                                "$set": {
                                    'Status': 'Confirmed'
                                }
                            };

                            console.log(objBack);
                        
                            betSaveInfoModel.findOneAndUpdate({_id: objBack[0]._id}, updateQuery, function(err, doc){
                                if(err){
                                    LogError(err, "UpdateDeposit");
                                }
                                
                                ExposureCalculation(doc, response);
                                console.log('Update completed for Back Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":layprice}, back_match_match_lay:"Lay", Status: "Pending", "sportsType" : "sports1"}).sort({"Created_date": -1}).exec(function(err,objLay) {
                        if (err) {
                            // include better error handling here                               
                            return LogError(err, "getMatchListbyMatchID");                        
                          }       
                          if (objLay.length > 0 ) {
                            console.log(objLay);    
                            let layupdateQuery = {
                                "$set": {
                                    'Status': 'Confirmed'
                                }
                            };
                        
                            betSaveInfoModel.findOneAndUpdate({_id: objLay[0]._id}, layupdateQuery, function(err, doc){
                                if(err){
                                    LogError(err, "UpdateDeposit");
                                }                                
                                ExposureCalculation(doc, response);
                                console.log('Update completed for Lay Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":backpricespt2}, back_match_match_lay:"Back",  Status: "Pending","sportsType" : "sports2"}).sort({"Created_date": -1}).exec(function(err,objBack) {
                        if (err) {
                            // include better error handling here                               
                            return LogError(err, "getMatchListbyMatchID");                        
                          }       
                          if (objBack.length > 0 ) {
                            console.log(objBack);    

                            let updateQuery = {
                                "$set": {
                                    'Status': 'Confirmed'
                                }
                            };
                        
                            betSaveInfoModel.findOneAndUpdate({_id: objBack[0]._id}, updateQuery, function(err, doc){
                                if(err){
                                    LogError(err, "UpdateDeposit");
                                }
                                ExposureCalculation(doc, response);
                                console.log('Update completed for Back Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":laypricespt2}, back_match_match_lay:"Lay", Status: "Pending", "sportsType" : "sports2"}).sort({"Created_date": -1}).exec(function(err,objLay) {
                        if (err) {
                            // include better error handling here                               
                            return LogError(err, "getMatchListbyMatchID");                        
                          }       
                          if (objLay.length > 0 ) {
                            console.log(objLay);    
                            let layupdateQuery = {
                                "$set": {
                                    'Status': 'Confirmed'
                                }
                            };
                        
                            betSaveInfoModel.findOneAndUpdate({_id: objLay[0]._id}, layupdateQuery, function(err, doc){
                                if(err){
                                    LogError(err, "UpdateDeposit");
                                }           
                                ExposureCalculation(doc, response);                     
                                console.log('Update completed for Lay Odds Matching from pending wager');
                                
                            });
                          }
                    });

                }                
              
                var matchDetails = response;
                //res.json({ "success": true, "errormessage": "", data: matchDetails });			
              
              });
            
        }

    });




    // request.post(
    //     config.ServerURL + 'saveglucosedata',
    //     { json: jsonResult },
    //     function (error, response, body) {
    //         console.log(body); 
    //         if (!error && response.statusCode == 200) {
    //             console.log(date.toISOString());
    //             console.log(body);                    
    //         }
    //     });

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


function ExposureCalculation(params, response) {
    console.log(params);

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
       
       var betdata = params;
       let profit = 0;
       let liability = 0;
    //    console.log('sports1back '+ sports1back, 'sports1lay ' + sports1lay, 'sports2back ' + sports2back, 'sports2lay '+ sports2lay)
    //    console.log(betdata.odds);
       
       if ( betdata.back_match_match_lay == 'Back' ) {
           if (betdata.sportsType === 'sports1' && (parseFloat(sports1back).toFixed(2) >= parseFloat(betdata.odds).toFixed(2))) {
               console.log('hello1');
            //betdata.odds =  sports1back; 
            betdata.liability_profit = (sports1back - 1) * betdata.stakeValue; 
            profit = (sports1back - 1) * betdata.stakeValue; 
            liability = betdata.stakeValue;
            betdata.Status = "Confirmed";  
           } else if ( betdata.sportsType === 'sports2' && parseFloat(sports2back).toFixed(2) >= parseFloat(betdata.odds).toFixed(2)) {
            // betdata.odds =  sports2back;
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
                "MatchId":betdata.matchid,
                "MarketId":betdata.marketid,
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
             
            }
       });

    });    

}