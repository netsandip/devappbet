//mongoose schema for getting data  

var mongoose = require('mongoose');
module.exports = mongoose.Schema({
    sports1betstake: String, 
    sports1betstakevalue: String,
    sports2betstake: String,
    sports2betstakevalue: String,
    sports1laylibality: String,    
    sports1laylibalityvalue: String,
    sports2laylibality: String,
    sports2laylibalityvalue: String,
    MatchId: String,
    MarketId: String,
    userid: String,
    Created_date : { type : Date, default: Date.now }
});
