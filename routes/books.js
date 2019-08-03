const express = require("express")
const router = express.Router()
const Book = require("../models/book")
const Review = require("../models/review")
const middleware = require("../middleware")

router.get("/", (req, res) => {
    const escapeRegex = text => {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        Book.find({title: regex}, (err, allBooks) => {
            if (err) {
                console.log(err)
            } else {
                if (allBooks.length === 0) {
                    req.flash("error", "No books match your search. Please try again.")
                    return res.redirect("back") 
                }
                res.render("books/index", {
                    books: allBooks, 
                    page: "books"
                })  
            }
        })
    } else {
        Book.find({}, (err, allBooks) => {
            if (err) {
                console.log(err)
            } else {
                res.render("books/index", {books: allBooks, page: "books"})  
            }
        })
    }
})

router.post("/", middleware.isLoggedIn, (req, res) => {
    const title = req.body.title 
    const author = req.body.author 
    const image = req.body.image 
    const synopsis = req.body.synopsis
    const creator = {
        id: req.user._id,
        username: req.user.username
    }
    const newBook = {title:title, author:author, image:image, synopsis:synopsis, creator:creator}
    Book.create(newBook, (err, newlyAdded) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books") 
        }
    })
}) 

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("books/new")
})

router.get("/:id", (req, res) => {
    Book.findById(req.params.id).populate("likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} 
    }).exec((err, foundBook) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books/show", {book: foundBook})  
        }
    }) 
})

router.get("/:id/edit", middleware.checkBookOwnership, (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        res.render("books/edit", {book: foundBook})
    }) 
})

router.put("/:id", middleware.checkBookOwnership, (req, res) => {
    delete req.body.book.rating
    Book.findByIdAndUpdate(req.params.id, req.body.book, (err, updatedBook) => {
        if (err) {
            res.redirect("/books")
        } else {
            res.redirect("/books/" + req.params.id) 
        }
    }) 
})

router.delete("/:id", middleware.checkBookOwnership, (req, res) => {
    Book.findByIdAndRemove(req.params.id, err => {
        if (err) {
            res.redirect("/books")
        } else {
            // delete all reviews associated with the book
            Review.remove({"_id": {$in: book.reviews}}, err => {
                if (err) {
                    console.log(err)
                    return res.redirect("/books")
                }
            })
            book.remove() 
            req.flash("success", "Book Removed")
            res.redirect("/books") 
        }
    })
})

router.post("/:id/like", middleware.isLoggedIn, (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if (err) {
            console.log(err) 
            res.redirect("/books")
        }
        const foundUserLike = foundBook.likes.some(like => {
            return like.equals(req.user._id)
        })
        
        if (foundUserLike) {
            foundBook.likes.pull(req.user._id)
        } else {
            foundBook.likes.push(req.user) 
        }

        foundBook.save(err => {
            if (err) {
                console.log(err)
                res.redirect("/books")
            }
            res.redirect("/books/" + foundBook._id) 
        })
    })
})

module.exports = router 