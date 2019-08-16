require('dotenv').config() 
const express = require('express')
const helmet = require('helmet')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const methodOverride = require("method-override")
const flash = require("connect-flash")

const bookRoutes = require("./routes/books")
const indexRoutes = require("./routes/index")
const reviewRoutes = require("./routes/reviews")
const commentRoutes = require("./routes/comments")
const userRoutes = require("./routes/users")

const User = require("./models/user")

const port = process.env.PORT || 3000 

mongoose.connect("mongodb://localhost/book_talk", { useNewUrlParser: true })
mongoose.set('useFindAndModify', false) 
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs") 
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method")) 
app.use(helmet())
app.use(flash()) 
app.locals.moment = require('moment')

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

app.use((req, res, next) => {
    res.locals.currentUser = req.user 
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success") 
    next() 
})

app.use(indexRoutes)
app.use("/books", bookRoutes)
app.use("/books/:id/reviews", reviewRoutes) 
app.use("/books/:id/comments", commentRoutes)
app.use("/users", userRoutes) 

app.listen(port, () => {
    console.log(`The BookTalk server has started on port ${port}`)
})