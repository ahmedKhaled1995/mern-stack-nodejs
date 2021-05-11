const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});

categorySchema.virtual("books", {
    ref: "Book",
    localField: "_id",
    foreignField: "category"
});

// defining model for category table
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;