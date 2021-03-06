/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  series: String,
  seriesNumber: Number,
  slug: {
    type: String,
    unique: true
  },
  author: String,
  image: String,
  imageId: String,
  synopsis: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  rating: {
    type: Number,
    default: 0
  }
});

bookSchema.pre("save", async function(next) {
  try {
    if (this.isNew || this.isModified("title")) {
      this.slug = await generateUniqueSlug(this._id, this.title);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;

const generateUniqueSlug = async (id, bookTitle, slug) => {
  try {
    if (!slug) {
      slug = slugify(bookTitle);
    }
    const book = await Book.findOne({ slug: slug });
    if (!book || book._id.equals(id)) {
      return slug;
    }
    const newSlug = slugify(bookTitle);
    return await generateUniqueSlug(id, bookTitle, newSlug);
  } catch (err) {
    throw new Error(err);
  }
};

const slugify = text => {
  const slug = text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
    .substring(0, 75); // Trim at 75 characters
  return `${slug}-${Math.floor(1000 + Math.random() * 9000)}`; // Add 4 random digits to improve uniqueness
};
