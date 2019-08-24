const express = require("express")
const router = express.Router()
const Book = require("../models/book")
const Comment = require("../models/comment")
const Review = require("../models/review")
const User = require("../models/user")
const Notification = require("../models/notification")
const middleware = require("../middleware")

router.get("/", (req, res) => {
    let perPage = 8
    let pageQuery = parseInt(req.query.page)
    let pageNumber = pageQuery ? pageQuery : 1
    const escapeRegex = text => {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        Book.find({title: regex}).sort({'_id': -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allBooks) => {
            Book.countDocuments({title: regex}).exec((err, count) => {
                if (err) {
                    console.log(err)
                    res.redirect("back")
                } else {
                    if (allBooks.length < 1) {
                        req.flash("error", "No books match that search. Please try again")
                        return res.redirect("back") 
                    }
                    res.render("books/index", {
                        books: allBooks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search,
                        page: "books" 
                    })
                }
            })
        })
    } else {
        // use .sort({'_id': -1}) for most recent entries first and .sort({'_id': 1}) for oldest entries first 
        Book.find({}).sort({'_id': -1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allBooks) => {
            Book.countDocuments().exec((err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render("books/index", {
                        books: allBooks, 
                        current: pageNumber, 
                        pages: Math.ceil(count / perPage),
                        search: false,
                        page: "books"
                    })
                }
            })
        })
    }
})

router.post("/", middleware.isLoggedIn, middleware.bookCoverImageIsAllowed, async function(req, res) {
    const title = req.body.title 
    const author = req.body.author 
    const image = req.body.image 
    const synopsis = req.body.synopsis
    const creator = {
        id: req.user._id,
        username: req.user.username
    }
    const newBook = {title:title, author:author, image:image, synopsis:synopsis, creator:creator}
    // Book.create(newBook, err => {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         req.flash("success", "Successfully added book!")
    //         res.redirect("/books") 
    //     }
    // })
    try {
        let book = await Book.create(newBook)
        let user = await User.findById(req.user._id).populate("followers").exec()
        let newNotification = { username: req.user.username, bookId: book.slug }
        for(const follower of user.followers) {
            let notification = await Notification.create(newNotification)
            follower.notifications.push(notification)
            follower.save() 
        }
        req.flash("success", "Successfully added book!")
        res.redirect("/books")
    } catch(err) {
        req.flash("error", err.message)
        res.redirect("back")
    }
}) 

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("books/new")
})

router.get("/:slug", (req, res) => {
    Book.findOne({slug: req.params.slug}).populate("likes").populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} 
    }).exec((err, foundBook) => {
        if (err) {
            console.log(err)
        } else {
            res.render("books/show", {book: foundBook})  
        }
    }) 
})

router.get("/:slug/edit", middleware.checkBookOwnership, (req, res) => {
    Book.findOne({slug: req.params.slug}, (err, foundBook) => {
        res.render("books/edit", {book: foundBook})
    }) 
})

router.put("/:slug", middleware.checkBookOwnership, middleware.bookCoverImageIsAllowed, (req, res) => {
    // delete req.body.book.rating
    // const newData = {title: req.body.title, author: req.body.author, image: req.body.image, synopsis: req.body.synopsis}
    Book.findOne({slug: req.params.slug}, (err, book) => {
        if (err) {
            res.redirect("/books")
        } else {
            book.title = req.body.title 
            book.author = req.body.author
            book.image = req.body.image
            book.synopsis = req.body.synopsis
            book.save(err => {
                if(err) {
                    console.log(err)
                    res.redirect("/books")
                } else {
                    res.redirect("/books/" + book.slug) 
                }
            })
        }
    }) 
})

router.delete("/:slug", middleware.checkBookOwnership, (req, res) => {
    Book.findOneAndRemove({slug: req.params.slug}, (err, book) => {
        if (err) {
            res.redirect("/books")
        } else {
            Comment.deleteMany({"_id": {$in: book.comments}}, err => {
                if (err) {
                    console.log(err)
                    return res.redirect("/books")
                }
                Review.deleteMany({"_id": {$in: book.reviews}}, err => {
                    if (err) {
                        console.log(err);
                        return res.redirect("/books")
                    }
                    book.remove();
                    req.flash("success", "Book removed")
                    res.redirect("/books")
                })
            })
        }
    })
})

router.post("/:slug/like", middleware.isLoggedIn, (req, res) => {
    Book.findOne({slug: req.params.slug}, (err, foundBook) => {
        if (err) {
            console.log(err) 
            res.redirect("/books")
        }
        const foundUserLike = foundBook.likes.some(like => {
            return like.equals(req.user._id)
        })
        
        if (foundUserLike) {
            foundBook.likes.pull(req.user._id)
        } else {
            foundBook.likes.push(req.user) 
        }

        foundBook.save(err => {
            if (err) {
                console.log(err)
                res.redirect("/books")
            }
            res.redirect("/books/" + foundBook.slug) 
        })
    })
})

module.exports = router 