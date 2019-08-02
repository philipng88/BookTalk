const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String,
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

module.exports = mongoose.model("Book", bookSchema)