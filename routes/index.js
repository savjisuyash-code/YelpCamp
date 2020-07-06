var express         = require("express");
var router          = express.Router();
var Campground      = require("../models/campground");
var Comment         = require("../models/comments");
var passport        = require("passport");
var User            = require("../models/user");


//Root Route//
router .get("/" , function(req , res){
    res.render("campgrounds/landing.ejs");
});


// AUTH ROUTES


// show register form
router.get("/register", function(req, res){
   res.render("auth/register.ejs", {page: 'register'}); 
});

//handle sign up logic

router.post("/register", function(req, res){
   var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
      });
   if(req.body.adminCode === 'secretcode123') {
      newUser.isAdmin = true;
    }
   User.register(newUser, req.body.password, function(err, newUser){
        if(err){
            console.log(err);
            return res.render("auth/register.ejs", {error: err.message});
        }
       passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + newUser.username + "!");
           res.redirect("/campgrounds");
       })
   })
})

//show login form
router.get("/login", function(req, res){
   res.render("auth/login.ejs", {page: 'login'}); 
});

//handle sign in logic

router .post("/login", passport.authenticate("local", {
    successRedirect : "/campgrounds",
    failureRedirect : "/login",
    failureFlash: true,
    successFlash: 'Welcome back!'
}), function(req,res){
    
});

//logout routes

router.get("/logout", function(req, res){
    req.logout();                       // COMES FREE WITH THE PASSPORT
    req.flash("success", "Logged out successfully!");
    res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
    {
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
}

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show.ejs", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

module.exports = router;