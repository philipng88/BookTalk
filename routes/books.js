const express = require("express")
const router = express.Router()
const Book = require("../models/book")
const middleware = require("../middleware")

router.get("/", (req, res) => {
    Book.find({}, (err, allBooks) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books/index", {books:allBooks}) 
        }
    })
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
    Book.findById(req.params.id).populate("likes").exec((err, foundBook) => {
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