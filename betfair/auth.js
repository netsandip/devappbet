var request = require('request');
var ErrorLogInterface = require('../common/errorLogger.js');

function BetFairAuthInterface() {
  if (!(this instanceof BetFairAuthInterface))
  return new BetFairAuthInterface();
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

BetFairAuthInterface.prototype.getAuthToken = function(cb) {
  
  // Configure the request
  var options = {
    url: 'http://35.197.194.223/createTokenApi/chkLoginuser',
    method: 'GET'
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
      LogError(error, "BetFairAuthInterface - getAuthToken");
    }
  })  
};

module.exports = BetFairAuthInterface;