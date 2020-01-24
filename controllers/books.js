const Book = require("../models/book");
const Comment = require("../models/comment");
const Review = require("../models/review");
const cloudinary = require("../utils/cloudinary");

const uploadParameters = {
  moderation: "webpurify",
  use_filename: true,
  folder: "BookTalk/BookCovers",
  width: 253,
  height: 385
};

module.exports = {
  getSearchResults(req, res) {
    const perPage = 8;
    const pageQuery = +req.query.page;
    const pageNumber = pageQuery || 1;
    const escapeRegex = text => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), "gi");
      Book.find({
        $or: [{ title: regex }, { series: regex }, { author: regex }]
      })
        .sort({ _id: -1 })
        .skip(perPage * pageNumber - perPage)
        .limit(perPage)
        .exec((err, allBooks) => {
          Book.countDocuments({
            $or: [{ title: regex }, { series: regex }, { author: regex }]
          }).exec((error, count) => {
            if (error) {
              console.log(error);
              res.redirect("back");
            } else {
              if (allBooks.length < 1) {
                req.flash(
                  "error",
                  "No books match that search. Please try again"
                );
                return res.redirect("back");
              }
              res.render("books/index", {
                books: allBooks,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: req.query.search,
                page: "books"
              });
            }
          });
        });
    } else {
      Book.find({})
        .sort({ _id: -1 })
        .skip(perPage * pageNumber - perPage)
        .limit(perPage)
        .exec((err, allBooks) => {
          Book.countDocuments().exec((error, count) => {
            if (error) {
              console.log(error);
            } else {
              res.render("books/index", {
                books: allBooks,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: false,
                page: "books"
              });
            }
          });
        });
    }
  },

  getNewBookPage(req, res) {
    res.render("books/new");
  },

  getBookRequestPage(req, res) {
    res.render("books/request");
  },

  getOneBook(req, res) {
    Book.findOne({ slug: req.params.slug })
      .populate("likes")
      .populate("comments")
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }
      })
      .exec((err, book) => {
        if (err || !book) {
          req.flash("error", "Book not found");
          res.redirect("back");
        } else {
          res.render("books/show", { book });
        }
      });
  },

  getBookEditPage(req, res) {
    Book.findOne({ slug: req.params.slug }, (err, book) => {
      if (err || !book) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        res.render("books/edit", { book });
      }
    });
  },

  postBook(req, res) {
    cloudinary.v2.uploader.upload(
      req.file.path,
      uploadParameters,
      (err, result) => {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        req.body.book.image = result.secure_url;
        req.body.book.imageId = result.public_id;
        Book.create(req.body.book, (error, book) => {
          if (error) {
            req.flash("error", error.message);
            return res.redirect("back");
          }
          req.flash("success", "Successfully added book!");
          res.redirect(`/books/${book.slug}`);
        });
        console.log(result);
      }
    );
  },

  editBook(req, res) {
    Book.findOne({ slug: req.params.slug }, async (err, book) => {
      if (err || !book) {
        req.flash("error", err.message);
        res.redirect("/books");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(book.imageId);
            const result = await cloudinary.v2.uploader.upload(
              req.file.path,
              uploadParameters
            );
            book.imageId = result.public_id;
            book.image = result.secure_url;
          } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
          }
        }
        book.title = req.body.title;
        book.series = req.body.series;
        book.seriesNumber = req.body.seriesNumber;
        book.author = req.body.author;
        book.synopsis = req.body.synopsis;
        book.save();
        req.flash("success", "Successfully updated book!");
        res.redirect(`/books/${book.slug}`);
      }
    });
  },

  deleteBook(req, res) {
    Book.findOne({ slug: req.params.slug }, async (err, book) => {
      if (err || !book) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      try {
        await cloudinary.v2.uploader.destroy(book.imageId);
        Comment.deleteMany({ _id: { $in: book.comments } }, error => {
          if (error) {
            console.log(error);
          }
        });
        Review.deleteMany({ _id: { $in: book.reviews } }, error => {
          if (error) {
            console.log(error);
          }
        });
        book.remove();
        req.flash("success", "Book removed");
        res.redirect("/books");
      } catch (error) {
        req.flash("error", error.message);
        return res.redirect("back");
      }
    });
  },

  toggleBookLike(req, res) {
    Book.findOne({ slug: req.params.slug }, (err, book) => {
      if (err || !book) {
        console.log(err);
        res.redirect("/books");
      }
      const foundUserLike = book.likes.some(like => {
        return like.equals(req.user._id);
      });

      if (foundUserLike) {
        book.likes.pull(req.user._id);
      } else {
        book.likes.push(req.user);
      }

      book.save(error => {
        if (error) {
          console.log(error);
          res.redirect("/books");
        }
        res.redirect(`/books/${book.slug}`);
      });
    });
  }
};
