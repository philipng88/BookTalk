require('dotenv').config() 
const express = require('express')
const helmet = require('helmet')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const methodOverride = require("method-override")

const bookRoutes = require("./routes/books")
const indexRoutes = require("./routes/index")

const User = require("./models/user")

const port = parseInt(process.env.PORT) 

mongoose.connect("mongodb://localhost/book_talk", { useNewUrlParser: true })
mongoose.set('useFindAndModify', false) 
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs") 
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method")) 
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

app.use((req, res, next) => {
    res.locals.currentUser = req.user 
    next() 
})

app.use(indexRoutes)
app.use("/books", bookRoutes) 

app.listen(port, () => {
    console.log(`The BookTalk server has started on port ${port}`)
})