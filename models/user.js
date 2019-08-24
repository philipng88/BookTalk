const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    profilePicture: String,
    aboutMe: String,
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isAdmin: {type: Boolean, default: false} 
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)