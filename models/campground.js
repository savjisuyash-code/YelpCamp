var mongoose = require("mongoose");

//Campground Schema
var CampgroundSchema = new mongoose.Schema({
    name  : String , 
    price : String,
    img : String,
    imgId : String,
    description : String,
    createdAt: { type: Date, default: Date.now },
    author :{
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    },
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
})
        
module.exports = mongoose.model("Campground" , CampgroundSchema); //Like a return statement in a function, we have to export modules to app.js

