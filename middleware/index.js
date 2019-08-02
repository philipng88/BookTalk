const Book = require("../models/book")
const middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        return next() 
    }
    req.flash("error", "Please Log In")
    res.redirect("/login") 
}

middlewareObj.checkBookOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, (err, foundBook) => {
            if (err) {
                req.flash("error", "Something went wrong...")
                res.redirect("back")
            } else {
                if (foundBook.creator.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have the required permissions for that action")
                    res.redirect("back")
                }
            }
        }) 
    } else {
        req.flash("error", "Please Log In")
        res.redirect("back")
    }
}

module.exports = middlewareObj