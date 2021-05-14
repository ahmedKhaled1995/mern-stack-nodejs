const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        min: '1900-01-01',   // y-m-d
        validate(value) {
            if (new Date().getFullYear() - value.getFullYear() < 18) {
                throw new Error("User must be 18 to continue!");
            }
        }
    },
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

authorSchema.virtual("books", {
    ref: "Book",
    localField: "_id",
    foreignField: "author"
});

// defining model for author table
const Author = mongoose.model("Author", authorSchema);

module.exports = Author;