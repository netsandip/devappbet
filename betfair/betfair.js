var request = require('request');
var async = require('async');
var querystring = require('querystring');
const util = require('util');

//var betfairAuthInterface = require('./auth.js');

var https = require('https');

var ssoid = "TbPxq/rvPt7s+hr20dDn8mJe0NCLZWCPjFrY7bAdW78=";
var appkey = "5OSppssp4jKjfpmh";


var appkey = appkey;
// Session token
var ssid = ssoid;
var FIRST_INDEX = 0;
var DEFAULT_ENCODING = 'utf-8';
var DEFAULT_JSON_FORMAT = '\t';

var options = {
    hostname: 'api.betfair.com',
    port: 443,
    path: '/exchange/betting/json-rpc/v1',
    method: 'POST',
    headers: {
        'X-Application': appkey,
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'X-Authentication': ssid
    }
}

function NewBetfairSportsInterface() {
    if (!(this instanceof NewBetfairSportsInterface))
        return new NewBetfairSportsInterface();
}

var LogError = function (error, moduleName) {
    let errorlogger = ErrorLogInterface();
    let errorModel = {
        message: error.message,
        modulename: moduleName,
        errorStack: error.errorStack === undefined ? JSON.stringify(error) : JSON.stringify(error.errorStack)
    }
    errorlogger.logError(errorModel);
}

function findHorseRaceId(options) {
    // console.log("Get horse racing event id");
    // Define Horse Racing in filter object
    var requestFilters = '{"filter":{}}';
    var jsonRequest = constructJsonRpcRequest('listEventTypes', requestFilters);
    var str = '';
    var req = https.request(options, function (res) {
        res.setEncoding(DEFAULT_ENCODING);
        res.on('data', function (chunk) {
            str += chunk;
        });

        res.on('end', function (chunk) {
            // On resposne parse Json and check for errors
            var response = JSON.parse(str);
            handleError(response);
            // Retrieve id from response and get next available horse race
            //getNextAvailableHorseRace(options, response);
            getListofCompitations(options, response);
        });

    });
    // Send Json request object
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();

    req.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
}


// Get next horse race based on current date
function getListofCompitations(options, response) {
    // Retrieve event id from previous response
    var eventId = retrieveEventId(response);
    var jsonDate = new Date().toJSON();
    
    var str = '';
    //var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + '],"marketStartTime":{"from":"'+jsonDate+'"}},"sort":"FIRST_TO_START","maxResults":"5","marketProjection":["RUNNER_DESCRIPTION"]}';
    var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + ']}}';
    var jsonRequest = constructJsonRpcRequest('listCompetitions', requestFilters);

    var req = https.request(options, function (res) {
        res.setEncoding(DEFAULT_ENCODING);
        res.on('data', function (chunk) {
            str += chunk;
        });

        res.on('end', function (chunk) {
            var response = JSON.parse(str);
            handleError(response);
            // Get list of runners that are available in that race
            //console.log(response);
            //getListOfRunners(options, response);
        });
    });
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();
    req.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
}

// get event id from the response
function retrieveEventId(response) {
    for (var i = 0; i <= Object.keys(response.result).length; i++) {
        if (response.result[i].eventType.name == 'Cricket') {
            return response.result[i].eventType.id;
        }
    }
}

// get selection id from the response
function retrieveSelectionId(response) {
    return response.result[FIRST_INDEX].runners[FIRST_INDEX].selectionId;
}

// get market id from the response
function retrieveMarketId(response) {
    return response.result[FIRST_INDEX].marketId;
}


function constructJsonRpcRequest(operation, params) {
    return '{"jsonrpc":"2.0","method":"SportsAPING/v1.0/' + operation + '", "params": ' + params + ', "id": 1}';
}

// Handle Api-NG errors, exception details are wrapped within response object 
function handleError(response) {
    // check for errors in response body, we can't check for status code as jsonrpc returns always 200
    if (response.error != null) {
        // if error in response contains only two fields it means that there is no detailed message of exception thrown from API-NG
        if (Object.keys(response.error).length > 2) {
            console.log("Error with request!!");
            console.log(JSON.stringify(response, null, DEFAULT_JSON_FORMAT));
            console.log("Exception Details: ");
            console.log(JSON.stringify(retrieveExceptionDetails(response), null, DEFAULT_JSON_FORMAT));
        }
        process.exit(1);
    }
}

// Get exception message out of a response object
function retrieveExceptionDetails(response) {
    return response.error.data.APINGException;
}

NewBetfairSportsInterface.prototype.getSportsList = function (id, cb) {

    //getListofCompitations(options, response);

    try {
        findHorseRaceId(options);


        async.waterfall([
                function firstStep(done) {
                    console.log('start!');
                    console.log("Get horse racing event id");
                    // Define Horse Racing in filter object
                    var requestFilters = '{"filter":{}}';
                    var jsonRequest = constructJsonRpcRequest('listEventTypes', requestFilters);
                    var str = '';
                    var req = https.request(options, function (res) {
                        res.setEncoding(DEFAULT_ENCODING);
                        res.on('data', function (chunk) {
                            str += chunk;
                        });

                        res.on('end', function (chunk) {
                            // On resposne parse Json and check for errors
                            var response = JSON.parse(str);
                            handleError(response);
                            // Retrieve id from response and get next available horse race
                            //getNextAvailableHorseRace(options, response);
                            done(null, response); // <- set value to passed to step 2
                            //getListofCompitations(options, response);
                        });

                    });
                    // Send Json request object
                    req.write(jsonRequest, DEFAULT_ENCODING);
                    req.end();

                    req.on('error', function (e) {
                        console.log('Problem with request: ' + e.message);
                    });

                },
                function secondStep(response, done) {
                    //console.log(step1Result);

                    var eventId = retrieveEventId(response);
                    // console.log(eventId);
                    var jsonDate = new Date().toJSON();
                    // console.log("Get next available horse race starting from date: " + jsonDate);
                    var str = '';
                    //var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + '],"marketStartTime":{"from":"'+jsonDate+'"}},"sort":"FIRST_TO_START","maxResults":"5","marketProjection":["RUNNER_DESCRIPTION"]}';
                    var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + ']}}';
                    var jsonRequest = constructJsonRpcRequest('listCompetitions', requestFilters);

                    var req = https.request(options, function (res) {
                        res.setEncoding(DEFAULT_ENCODING);
                        res.on('data', function (chunk) {
                            str += chunk;
                        });

                        res.on('end', function (chunk) {
                            var response = JSON.parse(str);
                            handleError(response);
                            // Get list of runners that are available in that race
                            //console.log(response);
                            done(null, response);
                            //getListOfRunners(options, response);
                        });
                    });
                    req.write(jsonRequest, DEFAULT_ENCODING);
                    req.end();
                    req.on('error', function (e) {
                        console.log('Problem with request: ' + e.message);
                    });

                    // <- set value to passed to step 3
                },
                function fourthStep(step3Result, done) {
                    // console.log(step3Result);

                    cb(null, step3Result.result);

                    done(null);
                }
            ],
            function (err) {
                if (err) {
                    throw new Error(err);
                } else {
                    console.log('No error happened in any steps, operation done!');
                }
            });

    } catch (error) {
        console.log(error);
    }

    // var dpsAuth = betfairAuthInterface();
    // dpsAuth.getAuthToken(function(err, response) {
    //   if (err) {
    //     // include better error handling here
    //     return LogError(err, "getAuthToken");
    //   }
    //   // use response here  
    //   var resp = JSON.parse(response);

    //    // Set the headers
    //   var headers = {
    //     'Content-Type': 'application/json'
    //   }

    //   var query = {"sprtId":"4","TokenId":resp.TokenId}

    //   // console.log(query);

    //   // Configure the request
    //   var options = {
    //     url: 'http://35.197.194.223/AjayApi/getSeriesOfSport',
    //     method: 'POST',
    //     headers: headers,
    //     json: query 
    //   }

    //   // Start the request
    //   request(options, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {        
    //         var val;
    //         try {
    //           val = body;
    //         } catch (err) {
    //           return cb(err);
    //         }
    //         cb(null, val);
    //     }
    //     else
    //     {

    //       LogError(error, "BetfairSportsInterface - getSportsList");
    //     }
    //   })

    // });

};

NewBetfairSportsInterface.prototype.getSportsListbySeriesID = function (id, cb) {

    try {
        //findHorseRaceId(options);


        async.waterfall([
                function firstStep(done) {
                    console.log('start!');
                    console.log("Get horse racing event id");
                    // Define Horse Racing in filter object
                    var requestFilters = '{"filter":{}}';
                    var jsonRequest = constructJsonRpcRequest('listEventTypes', requestFilters);
                    var str = '';
                    var req = https.request(options, function (res) {
                        res.setEncoding(DEFAULT_ENCODING);
                        res.on('data', function (chunk) {
                            str += chunk;
                        });

                        res.on('end', function (chunk) {
                            // On resposne parse Json and check for errors
                            var response = JSON.parse(str);
                            handleError(response);
                            // Retrieve id from response and get next available horse race
                            //getNextAvailableHorseRace(options, response);
                            done(null, response); // <- set value to passed to step 2
                            //getListofCompitations(options, response);
                        });

                    });
                    // Send Json request object
                    req.write(jsonRequest, DEFAULT_ENCODING);
                    req.end();

                    req.on('error', function (e) {
                        console.log('Problem with request: ' + e.message);
                    });

                },
                function secondStep(response, done) {
                    //console.log(step1Result);

                    var eventId = retrieveEventId(response);
                    // console.log(eventId);
                    var jsonDate = new Date().toJSON();
                    let compitationIds = id;
                    // console.log("Get next available horse race starting from date: " + jsonDate);
                    var str = '';
                    //var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + '],"marketStartTime":{"from":"'+jsonDate+'"}},"sort":"FIRST_TO_START","maxResults":"5","marketProjection":["RUNNER_DESCRIPTION"]}';
                    var requestFilters = '{"filter":{"eventTypeIds": [' + eventId + '], "competitionIds":[' + compitationIds +']}}';
                    var jsonRequest = constructJsonRpcRequest('listEvents', requestFilters);

                    var req = https.request(options, function (res) {
                        res.setEncoding(DEFAULT_ENCODING);
                        res.on('data', function (chunk) {
                            str += chunk;
                        });

                        res.on('end', function (chunk) {
                            var response = JSON.parse(str);
                            handleError(response);
                            // Get list of runners that are available in that race
                            //console.log(response);
                            done(null, response);
                            //getListOfRunners(options, response);
                        });
                    });
                    req.write(jsonRequest, DEFAULT_ENCODING);
                    req.end();
                    req.on('error', function (e) {
                        console.log('Problem with request: ' + e.message);
                    });

                    // <- set value to passed to step 3
                },
                function fourthStep(step3Result, done) {
                    // console.log(step3Result);

                    cb(null, step3Result.result);

                    done(null);
                }
            ],
            function (err) {
                if (err) {
                    throw new Error(err);
                } else {
                    console.log('No error happened in any steps, operation done!');
                }
            });

    } catch (error) {
        console.log(error);
    }

    

};

NewBetfairSportsInterface.prototype.getOddsbyMarketId = function (id, cb) {

    try {
        //findHorseRaceId(options);


        async.waterfall([
                function firstStep(done) {
                    var marketId = '1.152418778';
                    console.log("Get list of runners for market Id: " + marketId);
                    var requestFilters = '{"marketIds":["' + marketId + '"],"priceProjection":{"priceData":["EX_BEST_OFFERS"],"exBestOfferOverRides":{"bestPricesDepth":2,"rollupModel":"STAKE","rollupLimit":20},"virtualise":false,"rolloverStakes":false},"orderProjection":"ALL","matchProjection":"ROLLED_UP_BY_PRICE"}';
                    var jsonRequest = constructJsonRpcRequest('listMarketBook', requestFilters );
                    var str = '';
                    var req = https.request(options,function (res){
                        res.setEncoding(DEFAULT_ENCODING);
                        res.on('data', function (chunk) {
                            str += chunk;
                        });

                        res.on('end', function (chunk) {
                            var response = JSON.parse(str);
                            handleError(response);
                            // Place bet on first runner
                            //console.log(util.inspect(response, { showHidden: true, depth: null }));
                            done(null, response);
                            //placeBet(options, response, marketId);
                        });
                    });
                    req.write(jsonRequest, DEFAULT_ENCODING);
                    req.end();
                    req.on('error', function(e) {
                        console.log('Problem with request: ' + e.message);
                        return;
                    });
                },                
                function fourthStep(step3Result, done) {
                    
                    cb(null, step3Result.result);

                    done(null);
                }
            ],
            function (err) {
                if (err) {
                    throw new Error(err);
                } else {
                    console.log('No error happened in any steps, operation done!');
                }
            });

    } catch (error) {
        console.log(error);
    }

    

};

NewBetfairSportsInterface.prototype.getMatchListbyMatchID = function(matchid, cb) {
    console.log("inside betfair");
    var marketId = '1.152060282';
    var eventId = '12157674';
    try {
        async.waterfall([
            function firstStep(done) {
                var jsonDate = new Date().toJSON();
                //console.log("Get list of runners for market Id: " + marketId);
                var requestFilters = '{"filter":{"competitionIds": [' + eventId + '],"marketStartTime":{"from":"'+jsonDate+'"}},"sort":"FIRST_TO_START","maxResults":"5","marketProjection":["RUNNER_DESCRIPTION"]}';
                var jsonRequest = constructJsonRpcRequest('listMarketCatalogue', requestFilters );
                var str = '';
                var req = https.request(options,function (res){
                    res.setEncoding(DEFAULT_ENCODING);
                    res.on('data', function (chunk) {
                        str += chunk;
                    });

                    res.on('end', function (chunk) {
                        var response = JSON.parse(str);
                        handleError(response);
                        // Place bet on first runner
                        done(null, response);
                        //placeBet(options, response, marketId);
                    });
                });
                req.write(jsonRequest, DEFAULT_ENCODING);
                req.end();
                req.on('error', function(e) {
                    console.log('Problem with request: ' + e.message);
                    return;
                });
            },                
            function fourthStep(step3Result, done) {
                let result = [];
                result.push(step3Result.result[0]);
                console.log(result);
                cb(null, result);

                done(null);
            }
        ],
        function (err) {
            if (err) {
                throw new Error(err);
            } else {
                console.log('No error happened in any steps, operation done!');
            }
        });

    } catch (error) {
        
    }
    
  };
  



module.exports = NewBetfairSportsInterface;