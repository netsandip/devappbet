//mongoose schema for getting data  

var mongoose = require('mongoose');
module.exports = mongoose.Schema({
    userid: String,
    match_name: String,
    back_match_match_lay: String,
    odds: Number,
    liability_profit: Number,
    Status: String,
    MatchId: String,
    MarketId: String,
    Created_date : { type : Date, default: Date.now }
});


/*
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
*/