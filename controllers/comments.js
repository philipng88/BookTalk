const Book = require("../models/book");
const Comment = require("../models/comment");

module.exports = {
  getNewComment(req, res) {
    Book.findOne({ slug: req.params.slug }, (err, book) => {
      if (err) {
        console.log(err);
      } else {
        res.render("comments/new", { book });
      }
    });
  },

  postComment(req, res) {
    Book.findOne({ slug: req.params.slug }, (err, book) => {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        Comment.create(req.body.comment, (error, comment) => {
          if (error) {
            console.log(error);
          } else {
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            book.comments.push(comment);
            book.save();
            req.flash("success", "Comment posted");
            res.redirect(`/books/${book.slug}`);
          }
        });
      }
    });
  },

  getEditComment(req, res) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          book_slug: req.params.slug,
          comment: foundComment
        });
      }
    });
  },

  editComment(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, err => {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        req.flash("success", "Comment edited");
        res.redirect(`/books/${req.params.slug}`);
      }
    });
  },

  deleteComment(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        req.flash("success", "Comment deleted");
        res.redirect(`/books/${req.params.slug}`);
      }
    });
  }
};
