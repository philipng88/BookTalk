const express = require('express')
const router = express.Router() 
const middleware = require("../middleware")
const Notification = require("../models/notification")
const User = require("../models/user")

// follow user
router.get("/follow/:id", middleware.isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.params.id)
        let alreadyFollowing = user.followers.includes(req.user._id)  
        if (alreadyFollowing == true) {
            throw "You are already following this user"
        }
        user.followers.push(req.user._id)
        user.save()
        req.flash("success", "You are now following " + user.username + "!")
        res.redirect("/users/" + req.params.id)
    } catch(err) {
        req.flash("error", err)
        res.redirect("back") 
    }
})

// view all notifications
router.get("/notifications", middleware.isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.user._id).populate({path: "notifications", options: {sort: {"_id": -1}}}).exec()
        let allNotifications = user.notifications 
        res.render("notifications/index", {allNotifications})
    } catch(err) {
        req.flash("error", err.message)
        res.redirect("back")
    }
})

// handle notification
router.get("/notifications/:id", middleware.isLoggedIn, async function(req, res) {
    try {
        let notification = await Notification.findById(req.params.id)
        notification.isRead = true
        notification.save()
        res.redirect(`/books/${notification.bookId}`)
    } catch(err) {
        req.flash("error", err.message)
        res.redirect("back") 
    }
})

module.exports = router
