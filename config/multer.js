const multer = require('multer')

const storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname)
    }
})
const imageFilter = function (req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error('Only image files are allowed!'), false)
    }
    callback(null, true)
}
const upload = multer({ storage: storage, fileFilter: imageFilter})

module.exports = upload