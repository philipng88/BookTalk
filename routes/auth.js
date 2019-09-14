const express = require('express')
const router = express.Router()
const passport = require("passport")
const async = require("async")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const User = require("../models/user")

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

router.get("/forgot", (req, res) => {
    res.render("forgot")
})

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        done => {
            crypto.randomBytes(20, (err, buf) => {
                const token = buf.toString("hex")
                done(err, token)
            })
        },
        (token, done) => {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (!user) {
                    req.flash("error", "No account with that email address exists")
                    return res.redirect("/forgot")
                }
                user.resetPasswordToken = token
                user.resetPasswordExpires = Date.now() + 3600000
                user.save(err => {
                    done(err, token, user)
                })
            })
        },
        (token, user, done) => {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GMAILPW
                }
            })
            let mailOptions = {
                to: user.email,
                from: process.env.GMAIL,
                subject: "BookTalk Password Reset",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            }
            smtpTransport.sendMail(mailOptions, err => {
                console.log("Mail sent")
                req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions")
                done(err, "done")
            })
        }
    ], err => {
        if (err) return next(err)
        res.redirect("forgot")
    })
})

router.get("/reset/:token", (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired")
            return res.redirect("/forgot")
        }
        res.render("reset", {token: req.params.token})
    })
})

router.post("/reset/:token", (req, res) => {
    async.waterfall([
        done => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash("error", "Password reset token is invalid or has expired")
                    return res.redirect("back")
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined
                        user.resetPasswordExpires = undefined
                        user.save(err => {
                            req.logIn(user, err => {
                                done(err, user)
                            })
                        })
                    })
                } else {
                    req.flash("error", "Passwords do not match")
                    return res.redirect("back")
                }
            })
        },
        (user, done) => {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GMAILPW 
                }
            })
            let mailOptions = {
                to: user.email,
                from: process.env.GMAIL,
                subject: "Your password has been changed",
                text: "Hello,\n\n" + "This is a confirmation that the password for the account at " + user.email + " has just been changed.\n"
            }
            smtpTransport.sendMail(mailOptions, err => {
                req.flash("success", "Your password has been changed")
                done(err)
            })
        }
    ], err => {
        res.redirect("/books")
    })
})

module.exports = router 