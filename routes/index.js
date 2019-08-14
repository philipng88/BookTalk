const express = require("express")
const router = express.Router()
const passport = require("passport") 
const User = require("../models/user")
const Book = require("../models/book")

router.get("/", (req, res) => {
    res.render("landing")
})

router.get("/register", (req, res) => {
    res.render("register", {page: "register"})  
})

router.post("/register", (req, res) => {
    const newUser = new User({
        username: req.body.username, 
        profilePicture: req.body.profilePicture, 
        aboutMe: req.body.aboutMe
    })
    if (req.body.adminCode === process.env.ADMIN_CODE) {
        newUser.isAdmin = true
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("register")
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to BookTalk " + user.username)
            res.redirect("/books") 
        })
    })
})

router.get("/login", (req, res) => {
    res.render("login", {page: "login"})  
})

router.post("/login", passport.authenticate("local", {
    successRedirect: "/books", 
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Successfully Logged In"
}))

router.get("/logout", (req, res) => {
    req.logOut()
    req.flash("success", "Successfully Logged Out") 
    res.redirect("/books") 
})

module.exports = router 