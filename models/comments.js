var mongoose = require("mongoose");

//CommentSchema

var commentSchema = new mongoose.Schema({
    text : String,
    createdAt: { type: Date, default: Date.now },
    author : {                          //an object
        id : {                          //Again an object
            type : mongoose.Schema.Types.ObjectId,
            ref  : "User"
        },
        username : String
    }
});

//Compile to the module
module.exports = mongoose.model("Comment", commentSchema);