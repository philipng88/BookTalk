const express = require("express")
const router = express.Router()
const Book = require("../models/book")

router.get("/", (req, res) => {
    Book.find({}, (err, allBooks) => {
        if (err) {
            console.log(err)
        } else {
            res.render("index", {books:allBooks}) 
        }
    })
})

router.post("/", isLoggedIn, (req, res) => {
    const title = req.body.title 
    const author = req.body.author 
    const image = req.body.image 
    const synopsis = req.body.synopsis
    const newBook = {title:title, author:author, image:image, synopsis:synopsis}
    Book.create(newBook, (err, newlyAdded) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books") 
        }
    })
}) 

router.get("/new", isLoggedIn, (req, res) => {
    res.render("new.ejs")
})

router.get("/:id", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if (err) {
            console.log(err)
        } else {
            res.render("show", {book: foundBook})  
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