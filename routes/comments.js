const express = require("express")
const router = express.Router({mergeParams: true})
const Book = require("../models/book")
const Comment = require("../models/comment")
const middleware = require("../middleware")

router.get("/new", middleware.isLoggedIn, (req, res) => {
    Book.findById(req.params.id, (err, book) => {
        if (err) {
            console.log(err)
        } else {
            res.render("comments/new", {book: book}) 
        }
    }) 
})

router.post("/", middleware.isLoggedIn, (req, res) => {
    Book.findById(req.params.id, (err, book) => {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    comment.save()
                    book.comments.push(comment)
                    book.save()
                    req.flash("success", "Comment posted")
                    res.redirect("/books/" + book._id)
                }
            })
        }
    })
})

router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            res.render("comments/edit", {book_id: req.params.id, comment: foundComment})
        }
    })
})

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            req.flash("success", "Comment edited")
            res.redirect("/books/" + req.params.id) 
        }
    })
})

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            req.flash("success", "Comment deleted") 
            res.redirect("/books/" + req.params.id) 
        }
    })
})

module.exports = router