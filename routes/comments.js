var express         = require("express");
var router          = express.Router();
var Campground      = require("../models/campground.js");
var Comment         = require("../models/comments.js");
var middleWare      = require("../middleware");


//  ADDING COMMENT ROUTES


//The new is for comments and not for campgrounds

router.get("/campgrounds/:id/comments/new", middleWare.isLoggedIn, function(req, res){
    //Find the campground by id
    
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
             res.render("comments/new.ejs", {campground : campground});
        }
    })
   
})

//LOOKUP CAMPGROUND USING ID
//CREATE NEW COMMENT
//CONNECT CAMPGROUNDS WITH COMMENT
//REDIRECT TO CAMPGROUND SHOW PAGE

router.post("/campgrounds/:id/comments", middleWare.isLoggedIn, function(req,res){
    
    
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            Comment.create(req.body.comment, function(err,comment){
                if(err){ 
                    req.flash("error", "Something went wrong! Please try again.")
                } else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    
                    campground.comments.push(comment);
                    campground.save(function(err, comment){
                        if(err){
                           req.flash("error", "Something went wrong! Please try again.");
                        } else {
                            req.flash("success", "Successfully added comment");
                        }
                    });
                    res.redirect('/campgrounds/' + campground._id);
                }
            })
        }
    })
})

//edit comment
router.get("/campgrounds/:id/comments/:comment_id/edit", middleWare.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
                res.redirect("back");
        } else{
            res.render("comments/edit.ejs", {campground_id : req.params.id, comment : foundComment}); //req.params.id referes to campground id
        }
    })
    
});

//comment update
router.put("/campgrounds/:id/comments/:comment_id", middleWare.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})


//destroy comment
router.delete("/campgrounds/:id/comments/:comment_id", middleWare.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
             req.flash("success", "Comment deleted!")
            res.redirect("/campgrounds/" + req.params.id); //show page
        }
    })
    
})






module.exports = router;