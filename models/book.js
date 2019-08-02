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
    ]  
})

module.exports = mongoose.model("Book", bookSchema)