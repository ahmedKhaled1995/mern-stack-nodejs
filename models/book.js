const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    },
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

bookSchema.virtual("ratings", {
    ref: "Rating",
    localField: "_id",
    foreignField: "rated"
});

bookSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "bookReviewd"
});

// defining model for books table
const Book = mongoose.model("Book", bookSchema);

module.exports = Book;