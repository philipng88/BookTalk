const express = require('express')
const app = express()
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs") 

const books = [
    {title: "Fahrenheit 451", author: "Ray Bradbury", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1383718290l/13079982.jpg"},
    {title: "A Tale of Two Cities", author: "Charles Dickens", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1344922523l/1953.jpg"},
    {title: "Pride and Prejudice", author: "Jane Austen", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1320399351l/1885.jpg"},
    {title: "Fahrenheit 451", author: "Ray Bradbury", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1383718290l/13079982.jpg"},
    {title: "A Tale of Two Cities", author: "Charles Dickens", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1344922523l/1953.jpg"},
    {title: "Pride and Prejudice", author: "Jane Austen", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1320399351l/1885.jpg"},
    {title: "Fahrenheit 451", author: "Ray Bradbury", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1383718290l/13079982.jpg"},
    {title: "A Tale of Two Cities", author: "Charles Dickens", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1344922523l/1953.jpg"},
    {title: "Pride and Prejudice", author: "Jane Austen", image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1320399351l/1885.jpg"}
]

app.get("/", (req, res) => {
    res.render("landing")
})

app.get("/books", (req, res) => {
    res.render("books", {books:books}) 
})

app.post("/books", (req, res) => {
    const title = req.body.title 
    const author = req.body.author 
    const image = req.body.image 
    const newBook = {title:title, author:author, image:image}
    books.push(newBook)
    res.redirect("/books")
}) 

app.get("/books/new", (req, res) => {
    res.render("new.ejs")
})

app.listen(3000, () => {
    console.log("The BookTalk server has started")
})