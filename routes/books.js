const express = require("express")
const router = express.Router()
const Book = require("../models/book")
const Comment = require("../models/comment")
const Review = require("../models/review")
const middleware = require("../middleware")

const multer = require('multer')
const cloudinary = require('cloudinary')

// Multer and Cloudinary configuration
const storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname)
    }
})
const imageFilter = function (req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error('Only image files are allowed!'), false)
    }
    callback(null, true)
}
const upload = multer({ storage: storage, fileFilter: imageFilter})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

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

router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
        if(err) {
            req.flash("error", err.message)
            return res.redirect("back")
        }
        req.body.book.image = result.secure_url
        req.body.book.imageId = result.public_id
        req.body.book.creator = { id: req.user._id, username: req.user.username }
        Book.create(req.body.book, (err, book) => {
            if (err) {
                req.flash("error", err.message)
                return res.redirect("back") 
            } else {
                req.flash("success", "Successfully added book!")
                res.redirect("/books/" + book.slug) 
            }
        })
    }) 
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

router.put("/:slug", middleware.checkBookOwnership, upload.single('image'), (req, res) => {
    Book.findOne({slug: req.params.slug}, async function(err, book) {
        if (err) {
            req.flash("error", err.message)
            res.redirect("/books")
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(book.imageId)
                    let result = await cloudinary.v2.uploader.upload(req.file.path)
                    book.imageId = result.public_id
                    book.image = result.secure_url
                } catch(err) {
                    req.flash("error", err.message)
                    return res.redirect("back")
                }
            }
            book.title = req.body.title 
            book.series = req.body.series
            book.author = req.body.author
            book.synopsis = req.body.synopsis
            book.save()
            req.flash("success", "Successfully updated book!")
            res.redirect("/books/" + book.slug) 
        }
    }) 
})

router.delete("/:slug", middleware.checkBookOwnership, (req, res) => {
    Book.findOne({slug: req.params.slug}, async function(err, book) {
        if (err) {
            req.flash("error", err.message)
            return res.redirect("back")
        } 
        try {
            await cloudinary.v2.uploader.destroy(book.imageId)
            Comment.deleteMany({"_id": {$in: book.comments}}, err => {
                if (err) {
                    console.log(err)
                }
            })  
            Review.deleteMany({"_id": {$in: book.reviews}}, err => {
                if (err) {
                    console.log(err)
                }
            })  
            book.remove()
            req.flash("success", "Book removed")
            res.redirect("/books") 
        } catch (err) {
            req.flash("error", err.message)
            return res.redirect("back") 
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