const express = require("express");

const Rating = require("../models/rating");
const auth = require("../middlewares/auth");


const router = new express.Router();

router.post("/myRatings", auth, async (req, res) => {
    const rating = new Rating(req.body);
    rating.rater = req.authorizedUser._id;
    // console.log("author add");
    try {
        await rating.populate("rater bookRated").execPopulate();
        await rating.save();
        res.status(201).send({ rating: rating });
    } catch (error) {
        res.status(400).send(error);
    }
});


//GET /categories?completed=true
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/myRatings", auth, async (req, res) => {
    try {
        const match = { rater: req.authorizedUser._id };
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
        const ratings = await Rating.find(match).skip(skip).limit(limit).sort(sort).populate("rater bookRated").exec();
        res.send(ratings);
    } catch {
        res.status(500).send();
    }
});

router.get("/myRatings/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const myRating = await Rating.findOne({ _id, rater: req.authorizedUser._id }).populate("rater bookRated").exec();
    try {
        if (!myRating) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(myRating);
    } catch {
        res.status(500).send();
    }
});

router.patch("/myRatings/:id", auth, async (req, res) => {
    const ratingUpdateList = Object.keys(req.body);
    const allowedUpdatesList = ['rating'];
    const validUpdate = ratingUpdateList.every((update) => {
        return allowedUpdatesList.includes(update);
    });
    if (!validUpdate) {
        res.status(400).send({ error: "Invalid update parameters!" });
        return;
    }
    try {
        const ratingToUpdate = await Rating.findOne({ _id: req.params.id, rater: req.authorizedUser._id });
        if (!ratingToUpdate) {
            res.status(404).send();
            return;
        }
        ratingUpdateList.forEach((update) => {
            ratingToUpdate[update] = req.body[update];
        });
        await ratingToUpdate.save();
        res.send(ratingToUpdate);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/myRatings/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const deletedRating = await Rating.findOneAndDelete({ _id, rater: req.authorizedUser._id });
        if (!deletedRating) {
            res.status(404).send({ error: "Rating not found!" });
            return;
        }
        res.send(deletedRating);
    } catch (error) {
        res.status(500).send(error);
    }
});


router.get("/ratings/:id", auth, async (req, res) => {
    try {
        const match = { bookRated: req.params.id };
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
        const ratings = await Rating.find(match).skip(skip).limit(limit).sort(sort).populate("rater bookRated").exec();
        res.send(ratings);
    } catch {
        res.status(500).send();
    }
});


module.exports = router;