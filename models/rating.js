const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    rateing: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    rater: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    rated: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
});


ratingSchema.statics.getAvgRating = function (rateings) {
    try {
        let avgRating = 0;
        let count = 0;
        for (const rateingObj of rateings) {
            avgRating += rateingObj.rateing;
            count += 1;
        }
        return avgRating / count;
    } catch (err) {
        console.log(err);
    }
};

const RatingModel = mongoose.model("Rating", ratingSchema);


module.exports = RatingModel;