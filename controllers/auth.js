/* eslint-disable no-shadow */
const passport = require("passport");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user");

module.exports = {
  getRegisterPage(req, res) {
    res.render("auth/register", { page: "register" });
  },

  registerUser(req, res) {
    const newUser = new User({
      username: req.body.username,
      profilePicture: "/images/default-profile-picture.jpg",
      aboutMe: ""
    });

    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("register");
      }
      passport.authenticate("local")(req, res, () => {
        req.flash("success", `Welcome to BookTalk, ${user.username}!`);
        res.redirect("/books");
      });
    });
  },

  getLoginPage(req, res) {
    res.render("auth/login", { page: "login" });
  },

  logoutUser(req, res) {
    req.logOut();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/books");
  },

  getForgotPasswordPage(req, res) {
    res.render("auth/forgot");
  },

  passwordResetRequest(req, res, next) {
    async.waterfall(
      [
        done => {
          crypto.randomBytes(20, (err, buf) => {
            const token = buf.toString("hex");
            done(err, token);
          });
        },
        (token, done) => {
          User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
              req.flash("error", "No account with that email address exists");
              return res.redirect("/forgot");
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000;
            user.save(err => {
              done(err, token, user);
            });
          });
        },
        (token, user, done) => {
          const smtpTransport = nodemailer.createTransport({
            service: "Zoho",
            auth: {
              user: process.env.ZOHO,
              pass: process.env.ZOHOPW
            }
          });
          const mailOptions = {
            to: user.email,
            from: { name: "BookTalk Support", address: process.env.ZOHO },
            subject: "BookTalk Password Reset",
            text:
              // eslint-disable-next-line prefer-template
              "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://" +
              req.headers.host +
              "/reset/" +
              token
          };
          smtpTransport.sendMail(mailOptions, err => {
            req.flash(
              "success",
              `An e-mail has been sent to ${user.email} with further instructions`
            );
            done(err, "done");
          });
        }
      ],
      err => {
        if (err) return next(err);
        res.redirect("forgot");
      }
    );
  },

  getResetPasswordPage(req, res) {
    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      },
      (err, user) => {
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired");
          return res.redirect("/forgot");
        }
        res.render("auth/reset", { token: req.params.token });
      }
    );
  },

  resetPassword(req, res) {
    async.waterfall(
      [
        done => {
          User.findOne(
            {
              resetPasswordToken: req.params.token,
              resetPasswordExpires: { $gt: Date.now() }
            },
            (err, user) => {
              if (!user) {
                req.flash(
                  "error",
                  "Password reset token is invalid or has expired"
                );
                return res.redirect("back");
              }
              if (req.body.password === req.body.confirm) {
                user.setPassword(req.body.password, err => {
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
                  user.save(err => {
                    req.logIn(user, err => {
                      done(err, user);
                    });
                  });
                });
              } else {
                req.flash("error", "Passwords do not match");
                return res.redirect("back");
              }
            }
          );
        },
        (user, done) => {
          const smtpTransport = nodemailer.createTransport({
            service: "Zoho",
            auth: {
              user: process.env.ZOHO,
              pass: process.env.ZOHOPW
            }
          });
          const mailOptions = {
            to: user.email,
            from: { name: "BookTalk Support", address: process.env.ZOHO },
            subject: "Your password has been changed",
            text: `This is a confirmation that the password for the account at ${user.email} has just been changed`
          };
          smtpTransport.sendMail(mailOptions, err => {
            req.flash("success", "Your password has been changed");
            done(err);
          });
        }
      ],
      err => {
        res.redirect("/books");
      }
    );
  }
};
