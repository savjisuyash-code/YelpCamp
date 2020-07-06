require('dotenv').config()

var express              = require("express");
var app                  = express();
var bodyParser           = require('body-parser');
var mongoose             = require("mongoose");
var Campground           = require("./models/campground");
var seedDB               = require("./seeds"),
flash                    = require("connect-flash"),
Comment                  = require("./models/comments");
var passport             = require("passport"),
LocalStrategy            = require("passport-local"),
User                     = require("./models/user");
var methodOverride       = require("method-override");
const ejsLint            = require("ejs-lint");

var commentRoutes        = require("./routes/comments"),
    campgroundRoutes     = require("./routes/campgrounds"),
    reviewRoutes         = require("./routes/reviews"),
    indexRoutes          = require("./routes/index");
    


//seedDB();                                                   //This call will first remove the existing elements in the DB then add 3 more

//mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb+srv://savjisuyash:dungenmaster@cluster0.jwapg.mongodb.net/Cluster0?retryWrites=true&w=majority");

app.use(bodyParser.urlencoded({extended : true}));

app.use(express.static(__dirname + "/public"));  
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret : "A secret",
    resave : false,
    saveUninitialized : false
}));
 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));                           //In passport local mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//For every route to use currentUser that is logged in
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error     = req.flash("error");
    res.locals.success  = req.flash("success");
    next();
})
 

//requiring all the routes
app.use(indexRoutes);
app.use(campgroundRoutes);                                                      //We can do ("/campgrounds", campgroundRoutes) to avoid repetation in campground.js
app.use(commentRoutes);
app.use(reviewRoutes);                              //"/campgrounds/:id/reviews"

//Server
app.listen(process.env.PORT , process.env.IP , function(){
    console.log("The YelpCamp server has started!!");
});