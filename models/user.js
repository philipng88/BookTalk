const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    profilePicture: String,
    aboutMe: String,
    isAdmin: {type: Boolean, default: false} 
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)