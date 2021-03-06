//mongoose schema for getting data  

var mongoose = require('mongoose');
module.exports = mongoose.Schema({
    userid: String, 
    Name: String,
    EmailAddress: String,
    PhoneNumber: Number,    
    Password: String,
    Role:  { type : String, default: 'User' },
    Balance: Number,
    UnConfirmed_Balance: { type : Number, default: 0 },
    Created_date : { type : Date, default: Date.now }
});
