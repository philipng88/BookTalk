const Book = require("../models/book")
const middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        return next() 
    }
    res.redirect("/login") 
}

middlewareObj.checkBookOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, (err, foundBook) => {
            if (err) {
                res.redirect("back")
            } else {
                if (foundBook.creator.id.equals(req.user._id)) {
                    next()
                } else {
                    res.redirect("back")
                }
            }
        }) 
    } else {
        res.redirect("back")
    }
}

module.exports = middlewareObj