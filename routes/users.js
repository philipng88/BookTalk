const express = require("express");
const User = require("../models/user");
const middleware = require("../middleware");

const router = express.Router();

router.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", err.message);
      res.redirect("/books");
    }
    res.render("users/show", { user: foundUser, page: "profile" });
  });
});

router.get("/:id/edit", middleware.checkUserProfileOwnership, (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
      req.flash("error", "Something went wrong...");
      return res.redirect("back");
    }
    res.render("users/edit", { user: foundUser });
  });
});

router.put("/:id", middleware.checkUserProfileOwnership, (req, res) => {
  const newData = {
    username: req.body.username,
    email: req.body.email,
    profilePicture: req.body.profilePicture,
    aboutMe: req.body.aboutMe
  };
  User.findByIdAndUpdate(
    req.params.id,
    { $set: newData },
    (err, updatedUser) => {
      if (err) {
        req.flash("error", "Unable to update user profile");
        res.redirect("back");
      }
      req.flash("success", "Profile updated");
      res.redirect(`/users/${req.params.id}`);
    }
  );
});

module.exports = router;
