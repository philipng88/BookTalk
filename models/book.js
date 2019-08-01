const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String,
    synopsis: String  
})

module.exports = mongoose.model("Book", bookSchema)