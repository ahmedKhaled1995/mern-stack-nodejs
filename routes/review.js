const express = require("express");

const Review = require("../models/review");
const auth = require("../middlewares/auth");


const router = new express.Router();

router.post("/myReviews", auth, async (req, res) => {
    const review = new Review(req.body);
    review.reviewer = req.authorizedUser._id;
    // console.log("author add");
    try {
        await review.populate("reviewer bookReviewd").execPopulate();
        await review.save();
        res.status(201).send({ review: review });
    } catch (error) {
        res.status(400).send(error);
    }
});


//GET /categories?completed=true
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/myReviews", auth, async (req, res) => {
    try {
        const match = { reviewer: req.authorizedUser._id };
        let skip = req.query.skip ? parseInt(req.query.skip) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        // const completedQuery = req.query.completed;
        // if(completedQuery){
        //     match.completed = (completedQuery === "true");
        // }
        const sortBy = req.query.sortBy;
        const sort = {};
        if (sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = (parts[1] === "desc" ? -1 : 1);
        }
        const reviews = await Review.find(match).skip(skip).limit(limit).sort(sort).populate("reviewer bookReviewd").exec();
        res.send(reviews);
    } catch {
        res.status(500).send();
    }
});

router.get("/myReviews/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const myReview = await Review.findOne({ _id, reviewer: req.authorizedUser._id }).populate("reviewer bookReviewd").exec();
    try {
        if (!myReview) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(myReview);
    } catch {
        res.status(500).send();
    }
});

router.patch("/myReviews/:id", auth, async (req, res) => {
    const reviewUpdateList = Object.keys(req.body);
    const allowedUpdatesList = ['review'];
    const validUpdate = reviewUpdateList.every((update) => {
        return allowedUpdatesList.includes(update);
    });
    if (!validUpdate) {
        res.status(400).send({ error: "Invalid update parameters!" });
        return;
    }
    try {
        const reviewToUpdate = await Review.findOne({ _id: req.params.id, reviewer: req.authorizedUser._id });
        if (!reviewToUpdate) {
            res.status(404).send();
            return;
        }
        reviewUpdateList.forEach((update) => {
            reviewToUpdate[update] = req.body[update];
        });
        await reviewToUpdate.save();
        res.send(reviewToUpdate);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/myReviews/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const deletedReview = await Review.findOneAndDelete({ _id, reviewer: req.authorizedUser._id });
        if (!deletedReview) {
            res.status(404).send({ error: "Review not found!" });
            return;
        }
        res.send(deletedReview);
    } catch (error) {
        res.status(500).send(error);
    }
});


router.get("/reviews/:id", auth, async (req, res) => {
    try {
        const match = { bookReviewd: req.params.id };
        let skip = req.query.skip ? parseInt(req.query.skip) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        // const completedQuery = req.query.completed;
        // if(completedQuery){
        //     match.completed = (completedQuery === "true");
        // }
        const sortBy = req.query.sortBy;
        const sort = {};
        if (sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = (parts[1] === "desc" ? -1 : 1);
        }
        const reviews = await Review.find(match).skip(skip).limit(limit).sort(sort).populate("reviewer bookReviewd").exec();
        res.send(reviews);
    } catch {
        res.status(500).send();
    }
});


module.exports = router;