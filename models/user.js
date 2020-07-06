var mongoose = require("mongoose");
var passportLocalmongoose  = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username : String,
    passport : String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    isAdmin: {type: Boolean, default: false}
})

UserSchema.plugin(passportLocalmongoose) ; 

module.exports = mongoose.model("User", UserSchema);