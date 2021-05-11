const mongoose = require("mongoose");
const validator = require("validator");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: true,
        trim: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    bookReviewd: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
}, {
    timestamps: true
});

// defining model for review table
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;