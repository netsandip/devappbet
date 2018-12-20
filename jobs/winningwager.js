
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
    console.log("** Wager for winning match calculator **");
    betSaveInfoModel.aggregate([
        {
            $group: {_id: null, 
                MarketId: {$addToSet: "$MarketId"},
                MatchId: {$addToSet: "$MatchId"}}
        }
    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            //console.log(result);
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                // console.log(element.MarketId:);
                try {
                    sports.getOddsbyMatchID(element.MatchId, element.MarketId, function(err, response) {
                        if (err) {
                          // include better error handling here   
                          
                          return LogError(err, "getMatchListbyMatchID");
                      
                        }
                        // use response here
                        
                        console.log("hello");
                        if (response.MarketRunner.runners[0].status == 'WINNER') {
                            console.log(response.MarketRunner.runners[0].selectionId);    
                            sports.getSelectionNames(element.MarketId, function(err, response) {
                                if (response.length > 0) {
                                    console.log(response.runners);
                                }
                            });
                            
                        }
                    });    
                } catch (error) {
                    console.log(error);
                }
                
            }
        }

    });
});
