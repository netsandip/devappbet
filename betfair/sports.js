var request = require('request');

var querystring = require('querystring');
var betfairAuthInterface = require('./auth.js');

function BetfairSportsInterface() {
  if (!(this instanceof BetfairSportsInterface))
  return new BetfairSportsInterface();
}

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

BetfairSportsInterface.prototype.getSportsList = function(id, cb) {
  var options;
  
  var dpsAuth = betfairAuthInterface();
  dpsAuth.getAuthToken(function(err, response) {
    if (err) {
      // include better error handling here
      
      return LogError(err, "getAuthToken");
    }
    // use response here  
    var resp = JSON.parse(response);
    
     // Set the headers
    var headers = {
      'Content-Type': 'application/json'
    }

    var query = {"sprtId":"4","TokenId":resp.TokenId}

    console.log(query);

    // Configure the request
    var options = {
      url: 'http://35.177.14.80/AjayApi/getSeriesOfSport',
      method: 'POST',
      headers: headers,
      json: query 
    }

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {        
          var val;
          try {
            val = body;
          } catch (err) {
            return cb(err);
          }
          cb(null, val);
      }
      else
      {
        
        LogError(error, "BetfairSportsInterface - getSportsList");
      }
    })

  });
   
};

BetfairSportsInterface.prototype.getSportsListbySeriesID = function(seriesid, cb) {
  var options;
  
  var dpsAuth = betfairAuthInterface();
  dpsAuth.getAuthToken(function(err, response) {
    if (err) {
      // include better error handling here
      
      return LogError(err, "getAuthToken");
    }
    // use response here  
    var resp = JSON.parse(response);
    
     // Set the headers
    var headers = {
      'Content-Type': 'application/json'
    }

    var query = {"sprtId":"4","seriesId":seriesid,"TokenId":resp.TokenId}

    console.log(query);

    // Configure the request
    var options = {
      url: 'http://35.177.14.80/AjayApi/getMatchOfSport',
      method: 'POST',
      headers: headers,
      json: query 
    }

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {        
          var val;
          try {
            val = body;
          } catch (err) {
            return cb(err);
          }
          cb(null, val);
      }
      else
      {
        
        LogError(error, "BetfairSportsInterface - getSportsList");
      }
    })

  });
   
};

BetfairSportsInterface.prototype.getMatchListbyMatchID = function(matchid, cb) {
  var options;
  
  var dpsAuth = betfairAuthInterface();
  dpsAuth.getAuthToken(function(err, response) {
    if (err) {
      // include better error handling here
      
      return LogError(err, "getAuthToken");
    }
    // use response here  
    var resp = JSON.parse(response);
    
     // Set the headers
    var headers = {
      'Content-Type': 'application/json'
    }

    var query = {"MatchId":matchid,"TokenId":resp.TokenId}

    console.log(query);

    // Configure the request
    var options = {
      url: 'http://35.177.14.80/AjayApi/getMarketOfMatch',
      method: 'POST',
      headers: headers,
      json: query 
    }

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {        
          var val;
          try {
            val = body;
          } catch (err) {
            return cb(err);
          }
          cb(null, val);
      }
      else
      {
        
        LogError(error, "BetfairSportsInterface - getSportsList");
      }
    })

  });
   
};

BetfairSportsInterface.prototype.getOddsbyMatchID = function(matchid, marketid, cb) {
  var options;
  
  var dpsAuth = betfairAuthInterface();
  dpsAuth.getAuthToken(function(err, response) {
    if (err) {
      // include better error handling here
      
      return LogError(err, "getAuthToken");
    }
    // use response here  
    var resp = JSON.parse(response);
    
     // Set the headers
    var headers = {
      'Content-Type': 'application/json'
    }

    var query = {"MatchId":matchid,"TokenId":resp.TokenId,"MarketId":marketid}

    console.log(query);

    // Configure the request
    var options = {
      url: 'http://35.177.14.80/AjayApi/getBackLaysOfMarket',
      method: 'POST',
      headers: headers,
      json: query 
    }

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {        
          var val;
          try {
            val = body;
          } catch (err) {
            return cb(err);
          }
          cb(null, val);
      }
      else
      {
        
        LogError(error, "BetfairSportsInterface - getSportsList");
      }
    })

  });
   
};



module.exports = BetfairSportsInterface;