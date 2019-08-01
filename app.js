const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/book_talk", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs") 

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String 
})

const Book = mongoose.model("Book", bookSchema)

app.get("/", (req, res) => {
    res.render("landing")
})

app.get("/books", (req, res) => {
    Book.find({}, (err, allBooks) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books", {books:allBooks}) 
        }
    })
})

app.post("/books", (req, res) => {
    const title = req.body.title 
    const author = req.body.author 
    const image = req.body.image 
    const newBook = {title:title, author:author, image:image}
    Book.create(newBook, (err, newlyAdded) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books") 
        }
    })
}) 

app.get("/books/new", (req, res) => {
    res.render("new.ejs")
})

app.listen(3000, () => {
    console.log("The BookTalk server has started")
})