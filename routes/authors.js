const express = require("express");
const sharp = require("sharp");

const Author = require("../models/author");
const auth = require("../middlewares/auth");
const uplaoadAvatars = require("../helpers/uploadAvatars");


const router = new express.Router();

router.post("/authors", auth, async (req, res) => {
    const author = new Author(req.body);
    // console.log("author add");
    if (req.authorizedUser.isAdmin) {
        try {
            await author.save();
            res.status(201).send({ author });
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


//GET /authors?completed=true
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/authors", auth, async (req, res) => {
    try {
        const match = {};
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
        const authors = await Author.find(match).skip(skip).limit(limit).sort(sort).exec();
        res.send(authors);
    } catch {
        res.status(500).send();
    }
});

router.get("/authors/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const author = await Author.findOne({ _id });
    try {
        if (!author) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(author);
    } catch {
        res.status(500).send();
    }
});

router.patch("/authors/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const authorUpdateList = Object.keys(req.body);
        const allowedUpdatesList = ["firstName", "lastName", "dateOfBirth"];
        const validUpdate = authorUpdateList.every((update) => {
            return allowedUpdatesList.includes(update);
        });
        if (!validUpdate) {
            res.status(400).send({ error: "Invalid update parameters!" });
            return;
        }
        try {
            //const taskDocToUpdate = await Task.findById(req.params.id);
            const authorDocToUpdate = await Author.findOne({ _id: req.params.id });
            if (!authorDocToUpdate) {
                res.status(404).send();
                return;
            }
            authorUpdateList.forEach((update) => {
                authorDocToUpdate[update] = req.body[update];
            });
            await authorDocToUpdate.save();
            res.send(authorDocToUpdate);
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});

router.delete("/authors/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const _id = req.params.id;
        try {
            const deletedAuthor = await Author.findOneAndDelete({ _id });
            if (!deletedAuthor) {
                res.status(404).send({ error: "Author not found!" });
                return;
            }
            res.send(deletedAuthor);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


module.exports = router;