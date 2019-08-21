const express = require("express")
const router = express.Router({ mergeParams: true })
const Book = require("../models/book")
const Review = require("../models/review")
const middleware = require("../middleware")

const calculateAverage = reviews => {
    if (reviews.length === 0) {
        return 0
    }
    let sum = 0
    reviews.forEach(element => {
        sum += element.rating 
    })
    return sum / reviews.length 
}

router.get("/", (req, res) => {
    Book.findOne({slug: req.params.slug}).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec((err, book) => {
        if (err || !book) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        res.render("reviews/index", {book: book}) 
    })
})

router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    Book.findOne({slug: req.params.slug}, (err, book) => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        res.render("reviews/new", {book: book})
    })
})

router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    Book.findOne({slug: req.params.slug}).populate("reviews").exec((err, book) => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        Review.create(req.body.review, (err, review) => {
            if (err) {
                req.flash("error", err.message)
                return res.redirect("back")
            }
            review.author.id = req.user._id
            review.author.username = req.user.username
            review.book = book
            review.save()
            book.reviews.push(review)
            book.rating = calculateAverage(book.reviews)
            book.save()
            req.flash("success", "Review added")
            res.redirect("/books/" + book.slug)
        })
    })
})

router.get("/:review_id/edit", middleware.checkReviewOwnership, (req, res) => {
    Review.findById(req.params.review_id, (err, foundReview) => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        res.render("reviews/edit", {book_slug: req.params.slug, review: foundReview})
    })
})

router.put("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (err, updatedReview) => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        Book.findOne({slug: req.params.slug}).populate("reviews").exec((err, book) => {
            if (err) {
                req.flash("error", err.message)
                return res.redirect("back")
            }
            book.rating = calculateAverage(book.reviews)
            book.save()
            req.flash("success", "Review edited")
            res.redirect("/books/" + book.slug) 
        })
    })
})

router.delete("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndRemove(req.params.review_id, err => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        Book.findOneAndUpdate({slug: req.params.slug}, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((err, book) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            book.rating = calculateAverage(book.reviews)
            book.save()
            req.flash("success", "Review deleted")
            res.redirect("/books/" + req.params.slug)
        })
    })
})

module.exports = router