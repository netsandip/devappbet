
var schedule = require('node-schedule');
var mongoose = require('mongoose');
var connection = require('../connection');
var betSaveInfo = require('../dbmodels/betsave');
var betSaveInfoModel = mongoose.model('betplacementmaster', betSaveInfo, 'betplacementmaster');

mongoose.Promise = require('bluebird');
mongoose.connect(connection.connectionString, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true
  });


var j = schedule.scheduleJob('*/15 * * * * *', function() {   

    console.log('Inside the job');
    betSaveInfoModel.find({Status: "Pending"}).sort({"Created_date": -1}).exec(function(err,obj) { 
        console.log(obj);   
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
              
                var matchDetails = response;
                res.json({ "success": true, "errormessage": "", data: matchDetails });			
              
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