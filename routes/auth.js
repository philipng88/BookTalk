const express = require("express");
const passport = require("passport");

const {
  getRegisterPage,
  registerUser,
  getLoginPage,
  logoutUser,
  getForgotPasswordPage,
  passwordResetRequest,
  getResetPasswordPage,
  resetPassword
} = require("../controllers/auth");

const router = express.Router();

router.get("/register", getRegisterPage);
router.post("/register", registerUser);
router.get("/login", getLoginPage);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Successfully Logged In"
  })
);
router.get("/logout", logoutUser);
router.get("/forgot", getForgotPasswordPage);
router.post("/forgot", passwordResetRequest);
router.get("/reset/:token", getResetPasswordPage);
router.post("/reset/:token", resetPassword);

module.exports = router;
