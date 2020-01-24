const User = require("../models/user");

module.exports = {
  getUserProfilePage(req, res) {
    User.findById(req.params.id, (err, foundUser) => {
      if (err || !foundUser) {
        req.flash("error", err.message);
        res.redirect("/books");
      }
      res.render("users/show", { user: foundUser, page: "profile" });
    });
  },

  getUserProfileEditPage(req, res) {
    User.findById(req.params.id, (err, foundUser) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.render("users/edit", { user: foundUser });
    });
  }

  // editUserProfile(req, res) {
  //   const newData = {
  //     username: req.body.username,
  //     email: req.body.email,
  //     profilePicture: req.body.profilePicture,
  //     aboutMe: req.body.aboutMe
  //   };
  //   User.findByIdAndUpdate(req.params.id, { $set: newData }, err => {
  //     if (err) {
  //       req.flash("error", "Unable to update user profile");
  //       res.redirect("back");
  //     }
  //     req.flash("success", "Profile updated");
  //     res.redirect(`/users/${req.params.id}`);
  //   });
  // }
};
