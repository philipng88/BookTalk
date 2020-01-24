/* eslint-disable no-shadow */
const Book = require("../models/book");
const Review = require("../models/review");

const calculateAverage = reviews => {
  if (reviews.length === 0) {
    return 0;
  }
  let sum = 0;
  reviews.forEach(element => {
    sum += element.rating;
  });
  return sum / reviews.length;
};

module.exports = {
  getReviews(req, res) {
    Book.findOne({ slug: req.params.slug })
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }
      })
      .exec((err, book) => {
        if (err || !book) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        res.render("reviews/index", { book });
      });
  },

  getNewReviewPage(req, res) {
    Book.findOne({ slug: req.params.slug }, (err, book) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.render("reviews/new", { book });
    });
  },

  postReview(req, res) {
    Book.findOne({ slug: req.params.slug })
      .populate("reviews")
      .exec((err, book) => {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        Review.create(req.body.review, (err, review) => {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          review.author.id = req.user._id;
          review.author.username = req.user.username;
          review.book = book;
          review.save();
          book.reviews.push(review);
          book.rating = calculateAverage(book.reviews);
          book.save();
          req.flash("success", "Review added");
          res.redirect(`/books/${book.slug}`);
        });
      });
  },

  getReviewEditPage(req, res) {
    Review.findById(req.params.review_id, (err, foundReview) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.render("reviews/edit", {
        book_slug: req.params.slug,
        review: foundReview
      });
    });
  },

  editReview(req, res) {
    Review.findByIdAndUpdate(
      req.params.review_id,
      req.body.review,
      { new: true },
      err => {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        Book.findOne({ slug: req.params.slug })
          .populate("reviews")
          .exec((err, book) => {
            if (err) {
              req.flash("error", err.message);
              return res.redirect("back");
            }
            book.rating = calculateAverage(book.reviews);
            book.save();
            req.flash("success", "Review edited");
            res.redirect(`/books/${book.slug}`);
          });
      }
    );
  },

  deleteReview(req, res) {
    Review.findByIdAndRemove(req.params.review_id, err => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      Book.findOneAndUpdate(
        { slug: req.params.slug },
        { $pull: { reviews: req.params.review_id } },
        { new: true }
      )
        .populate("reviews")
        .exec((err, book) => {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          book.rating = calculateAverage(book.reviews);
          book.save();
          req.flash("success", "Review deleted");
          res.redirect(`/books/${req.params.slug}`);
        });
    });
  }
};
