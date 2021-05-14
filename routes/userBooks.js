const express = require("express");

const UserBook = require("../models/userBook");
const auth = require("../middlewares/auth");


const router = new express.Router();

router.post("/myBooks", auth, async (req, res) => {
    const myBook = new UserBook(req.body);
    myBook.user = req.authorizedUser._id;
    // console.log("author add");
    try {
        await myBook.populate("user book").execPopulate();
        await myBook.save();
        res.status(201).send({ myBook: myBook });
    } catch (error) {
        res.status(400).send(error);
    }
});


//GET /myBooks?shelveStatus=Currently_Reading
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/myBooks", auth, async (req, res) => {
    try {
        const match = { user: req.authorizedUser._id };
        let skip = req.query.skip ? parseInt(req.query.skip) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const shelveStatusQuery = req.query.shelveStatus;
        if (shelveStatusQuery) {
            match.shelveStatus = shelveStatusQuery;
        }
        const sortBy = req.query.sortBy;
        const sort = {};
        if (sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = (parts[1] === "desc" ? -1 : 1);
        }
        const myBooks = await UserBook.find(match).skip(skip).limit(limit).sort(sort).populate("user book").exec();
        res.send(myBooks);
    } catch {
        res.status(500).send();
    }
});

router.get("/myBooks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const myBook = await UserBook.findOne({ _id, user: req.authorizedUser._id }).populate("user book").exec();
    try {
        if (!myBook) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(myBook);
    } catch {
        res.status(500).send();
    }
});

router.patch("/myBooks/:id", auth, async (req, res) => {
    const userBookUpdateList = Object.keys(req.body);
    const allowedUpdatesList = ['shelveStatus'];
    const validUpdate = userBookUpdateList.every((update) => {
        return allowedUpdatesList.includes(update);
    });
    if (!validUpdate) {
        res.status(400).send({ error: "Invalid update parameters!" });
        return;
    }
    try {
        const userBookToUpdate = await UserBook.findOne({ _id: req.params.id, user: req.authorizedUser._id });
        if (!userBookToUpdate) {
            res.status(404).send();
            return;
        }
        userBookUpdateList.forEach((update) => {
            userBookToUpdate[update] = req.body[update];
        });
        await userBookToUpdate.save();
        res.send(userBookToUpdate);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/myBooks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const deletedBook = await UserBook.findOneAndDelete({ _id, user: req.authorizedUser._id });
        if (!deletedBook) {
            res.status(404).send({ error: "Book not found!" });
            return;
        }
        res.send(deletedBook);
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;