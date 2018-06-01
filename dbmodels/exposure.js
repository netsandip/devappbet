var mongoose = require('mongoose');
module.exports = mongoose.Schema({
    userid: String,
    match_name: String,    
    Status: String,
    MatchId: String,
    MarketId: String,
    exposureValue: Number,
    status: String,
    Created_date : { type : Date, default: Date.now }
});
