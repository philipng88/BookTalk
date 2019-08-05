const Book = require("../models/book")
const Review = require("../models/review")
const Comment = require("../models/comment")
const middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        return next() 
    }
    req.flash("error", "Please Log In")
    res.redirect("/login") 
}

middlewareObj.checkBookOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, (err, foundBook) => {
            if (err) {
                req.flash("error", "Something went wrong...")
                res.redirect("back")
            } else {
                if (foundBook.creator.id.equals(req.user._id) || req.user.isAdmin) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back")
                }
            }
        }) 
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back")
    }
}

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, (err, foundReview) => {
            if (err || !foundReview) {
                req.flash("error", "Something went wrong...")
                res.redirect("back") 
            } else {
                if (foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back")
                }
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back")
    }
}

middlewareObj.checkReviewExistence = (req, res, next) => {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id).populate("reviews").exec((err, foundBook) => {
            if (err || !foundBook) {
                req.flash("error", "Book not found")
                res.redirect("back")
            } else {
                const foundUserReview = foundBook.reviews.some(review => {
                    return review.author.id.equals(req.user._id)
                })
                if (foundUserReview) {
                    req.flash("error", "You have already written a review for this book")
                    return res.redirect("/books/" + foundBook._id)
                }
                next()
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back")
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err) {
                req.flash("error", "Comment not found") 
                res.redirect("back")
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back") 
                }
            }
        })
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back") 
    }
}

module.exports = middlewareObj