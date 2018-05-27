
var schedule = require('node-schedule');
var mongoose = require('mongoose');
var connection = require('../connection');
var betSaveInfo = require('../dbmodels/betsave');
var betSaveInfoModel = mongoose.model('betplacementmaster', betSaveInfo, 'betplacementmaster');

var sportsInterface = require('../betfair/sports.js');
var sports = sportsInterface();

mongoose.Promise = require('bluebird');
mongoose.connect(connection.connectionString, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true
  });


var j = schedule.scheduleJob('*/15 * * * * *', function() {   

    console.log('Inside the job');
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
                console.log(response.MarketRunner.runners[0]);
                if (response.MarketRunner.runners[0].status != 'LOSER') {
                    let backprice = response.MarketRunner.runners[0].ex.availableToBack[0].price;
                    let layprice = response.MarketRunner.runners[0].ex.availableToLay[0].price;
                    let backpricespt2 = response.MarketRunner.runners[1].ex.availableToBack[0].price;
                    let laypricespt2 = response.MarketRunner.runners[1].ex.availableToLay[0].price;
                    console.log(backprice +  ' '  +  layprice);    
                    console.log(backpricespt2 +  ' '  +  laypricespt2);    

                    betSaveInfoModel.find({ "odds":{"$lte":backprice}, back_match_match_lay:"Back",  Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,objBack) {
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
                                
                                console.log('Update completed for Back Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":layprice}, back_match_match_lay:"Lay", Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,objLay) {
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
                                console.log('Update completed for Lay Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":backpricespt2}, back_match_match_lay:"Back",  Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,objBack) {
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
                                
                                console.log('Update completed for Back Odds Matching from pending wager');
                                
                            });
                          }
                    });

                    betSaveInfoModel.find({ "odds":{"$lte":laypricespt2}, back_match_match_lay:"Lay", Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,objLay) {
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