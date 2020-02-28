require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const favicon = require("serve-favicon");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");
const morgan = require("morgan");

const bookRoutes = require("./routes/books");
const reviewRoutes = require("./routes/reviews");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");
const authorizationRoutes = require("./routes/auth");

const User = require("./models/user");

const environment = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;

const app = express();

mongoose
  .connect("mongodb://localhost/book_talk", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("Database connection successful"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(methodOverride("_method"));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(flash());
app.use(favicon(path.join(__dirname, "public", "images", "favicon.png")));
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => res.render("landing"));
app.use("/books", bookRoutes);
app.use("/books/:slug/reviews", reviewRoutes);
app.use("/books/:slug/comments", commentRoutes);
app.use("/users", userRoutes);
app.use(authorizationRoutes);
app.use((req, res, next) => {
  res.status(404).render("error");
});

app.listen(port, () => {
  console.log(`The BookTalk server has started on port ${port}`);
  console.log(`Running in ${environment} environment`);
});
