const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Book = require('../models/book')
const middleware = require("../middleware")

router.get("/:id", async function(req, res) {
    try {
        let user = await User.findById(req.params.id).populate("followers").exec()
        Book.find().where("creator.id").equals(user._id).exec(async function(err, books) {
            if(err) {
                req.flash("error", "Something went wrong...")
                res.redirect("/books")
            }
            res.render("users/show", {user, books})
        })
    } catch(err) {
        req.flash("error", err.message)
        return res.redirect("back")
    }
})

router.get("/:id/edit", middleware.checkUserProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash("error", "Something went wrong...")
            return res.redirect("back")
        }
        res.render("users/edit", {user: foundUser})
    })
})

router.put("/:id", middleware.checkUserProfileOwnership, (req, res) => {
    let newData = {
        username: req.body.username, 
        profilePicture: req.body.profilePicture, 
        aboutMe: req.body.aboutMe, 
    }
    User.findByIdAndUpdate(req.params.id, {$set: newData}, (err, updatedUser) => {
        if (err) {
            req.flash("error", "Unable to update user profile")
            res.redirect("back")
        }
        req.flash("success", "Profile updated")
        res.redirect("/users/" + req.params.id) 
    })
})

module.exports = router