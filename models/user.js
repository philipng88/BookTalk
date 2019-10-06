const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        unique: true, 
        required: true
    },
    email: {
        type: String, 
        unique: true, 
        // required: true
    },
    password: String,
    profilePicture: String,
    aboutMe: String,
    isAdmin: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date 
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)