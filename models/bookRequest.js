const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema({
  requester: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  requestedAt: {
    type: Date,
    default: Date.now()
  },
  title: { type: String, required: true },
  series: String,
  author: { type: String, required: true },
  publisher: String,
  genre: String,
  isbn: String
});

const bookRequest = mongoose.model("bookRequest", bookRequestSchema);
module.exports = bookRequest;
