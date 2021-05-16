const express = require("express");

const Category = require("../models/category");
const auth = require("../middlewares/auth");


const router = new express.Router();

router.post("/categories", auth, async (req, res) => {
    const category = new Category(req.body);
    // console.log("author add");
    if (req.authorizedUser.isAdmin) {
        try {
            await category.save();
            res.status(201).send({ category: category });
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


//GET /categories?completed=true
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/categories", auth, async (req, res) => {
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
        const categories = await Category.find(match).skip(skip).limit(limit).sort(sort).exec();
        res.send(categories);
    } catch {
        res.status(500).send();
    }
});

router.get("/categories/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const category = await Category.findOne({ _id });
    try {
        if (!category) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(category);
    } catch {
        res.status(500).send();
    }
});

router.patch("/categories/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const categoryUpdateList = Object.keys(req.body);
        const allowedUpdatesList = ["name"];
        const validUpdate = categoryUpdateList.every((update) => {
            return allowedUpdatesList.includes(update);
        });
        if (!validUpdate) {
            res.status(400).send({ error: "Invalid update parameters!" });
            return;
        }
        try {
            //const taskDocToUpdate = await Task.findById(req.params.id);
            const categoryDocToUpdate = await Category.findOne({ _id: req.params.id });
            if (!categoryDocToUpdate) {
                res.status(404).send();
                return;
            }
            categoryUpdateList.forEach((update) => {
                categoryDocToUpdate[update] = req.body[update];
            });
            await categoryDocToUpdate.save();
            res.send(categoryDocToUpdate);
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});

router.delete("/categories/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const _id = req.params.id;
        try {
            const deletedCategory = await Category.findOneAndDelete({ _id });
            if (!deletedCategory) {
                res.status(404).send({ error: "Author not found!" });
                return;
            }
            res.send(deletedCategory);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


module.exports = router;