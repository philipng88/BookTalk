require('dotenv').config() 
const express = require('express')
const helmet = require('helmet')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")

const User = require("./models/user")
const Book = require("./models/book")

const port = parseInt(process.env.PORT) 

mongoose.connect("mongodb://localhost/book_talk", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs") 
app.use(express.static(__dirname + "/public")) 
app.use(helmet())

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", (req, res) => {
    res.render("landing")
})

app.get("/books", (req, res) => {
    Book.find({}, (err, allBooks) => {
        if (err) {
            console.log(err)
        } else {
            res.render("index", {books:allBooks}) 
        }
    })
})

app.post("/books", isLoggedIn, (req, res) => {
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

app.get("/books/new", isLoggedIn, (req, res) => {
    res.render("new.ejs")
})

app.get("/books/:id", (req, res) => {
    Book.findById(req.params.id, (err, foundBook) => {
        if (err) {
            console.log(err)
        } else {
            res.render("show", {book: foundBook})  
        }
    }) 
})

app.get("/register", (req, res) => {
    res.render("register") 
})

app.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            return res.render("register")
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/books") 
        })
    })
})

app.get("/login", (req, res) => {
    res.render("login") 
})

app.post("/login", passport.authenticate("local", {successRedirect: "/books", failureRedirect: "/login"}))

app.get("/logout", (req, res) => {
    req.logOut()
    res.redirect("/books") 
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next() 
    }
    res.redirect("/login") 
}

app.listen(port, () => {
    console.log(`The BookTalk server has started on port ${port}`)
})