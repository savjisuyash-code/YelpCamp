var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground.js");
var middleWare = require("../middleware");
var Review     = require("../models/review");
var Comment         = require("../models/comments.js");


//Image uploading feature
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dbpg2wnnh', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
//////////////
// INDEX ROUTE
router.get("/campgrounds" , function(req , res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCamps){
           if(err){
               console.log(err);
           } else {
              if(allCamps.length < 1) {
                //   noMatch = "No campgrounds match that query, please try again.";
               return res.render("campgrounds/index.ejs",{error:"No campgrounds match that query, please try again.",campgrounds:allCamps, noMatch: noMatch , currentUser : req.user, page: 'campgrounds'});
            }
              res.render("campgrounds/index.ejs",{campgrounds:allCamps, noMatch: noMatch , currentUser : req.user, page: 'campgrounds'});
           }
        });
    }
    else{
         
        //Get all campgrounds from the database
        Campground.find({} , function(err , allCamps){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index.ejs" , {campgrounds : allCamps, noMatch: noMatch, currentUser : req.user, page: 'campgrounds'})
            }
        })
    }
   
});



//CREATE - add new campground to DB
router.post("/campgrounds", middleWare.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.img = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imgId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});



//NEW ROUTE
//The new is for campgrounds and not comments
router.get("/campgrounds/new", middleWare.isLoggedIn, function(req , res){
    res.render("campgrounds/new.ejs");
});

//SHOW ROUTE
router.get("/campgrounds/:id" , function(req , res){
    //FIND THE CAMPGROUND WITH PROVIDED ID
    //To populate the comments which are in the form of ARRAY
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err , foundCamp){  //BUILT-IN FUNCTION PROVIDED BY MONGO
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/show.ejs" , {campground : foundCamp});
        }
    })
    //RENDER BACK THE TEMPLATE HAVING THAT CAMPGROUND
})

//Edit Campground
//Is user logged in
    //If user is Authorized
    //If not, redirect
//If not, redirect

router.get("/campgrounds/:id/edit", middleWare.checkCampgroundOwnership, function(req, res){

    Campground.findById(req.params.id, function(err,foundCampground){
        res.render("campgrounds/edit.ejs", {campground : foundCampground});
    });
})

//PUT request

router.put("/campgrounds/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imgId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imgId = result.public_id;
                  campground.img = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.price = req.body.campground.price;
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

//Destroy campground
router.delete('/campgrounds/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imgId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;