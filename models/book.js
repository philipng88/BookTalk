const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String,
    synopsis: String,
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