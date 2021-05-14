const mongoose = require("mongoose");

const userBookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    shelveStatus: {
        type: String,
        enum: ['Read', 'Currently_Reading', 'Want_To_Read'],
        require: true,
    },
}, {
    timestamps: true
});

// defining model for userBook table
const UserBook = mongoose.model("UserBook", userBookSchema);

module.exports = UserBook;