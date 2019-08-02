const express = require("express")
const router = express.Router()
const Book = require("../models/book")

router.get("/", (req, res) => {
    Book.find({}, (err, allBooks) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books/index", {books:allBooks}) 
        }
    })
})

router.post("/", isLoggedIn, (req, res) => {
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

router.get("/new", isLoggedIn, (req, res) => {
    res.render("books/new")
})

router.get("/:id", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books/show", {book: foundBook})  
        }
    }) 
})

router.get("/:id/edit", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if (err) {
            res.redirect("/books")
        } else {
            res.render("books/edit", {book: foundBook})
        }
    }) 
})

router.put("/:id", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, req.body.book, (err, updatedBook) => {
        if (err) {
            res.redirect("/books")
        } else {
            res.redirect("/books/" + req.params.id) 
        }
    }) 
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next() 
    }
    res.redirect("/login") 
}

module.exports = router 