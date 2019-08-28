const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    title: String,
    slug: {
        type: String,
        unique: true
    },
    author: String,
    image: String,
    imageId: String,
    synopsis: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }  
})

bookSchema.pre('save', async function(next) {
    try {
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title)
        }
        next()
    } catch(err) {
        next(err) 
    }
})

const Book = mongoose.model("Book", bookSchema)
module.exports = Book

async function generateUniqueSlug(id, bookTitle, slug) {
    try {
        if (!slug) {
            slug = slugify(bookTitle)
        }
        var book = await Book.findOne({slug:slug})
        if (!book || book._id.equals(id)) {
            return slug
        } 
        var newSlug = slugify(bookTitle)
        return await generateUniqueSlug(id, bookTitle, newSlug)
    } catch(err) {
        throw new Error(err) 
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}