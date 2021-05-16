const express = require("express");

const Book = require("../models/book");
const auth = require("../middlewares/auth");


const router = new express.Router();

router.post("/books", auth, async (req, res) => {
    const book = new Book(req.body);
    // console.log("author add");
    if (req.authorizedUser.isAdmin) {
        try {
            await book.populate("category author").execPopulate();
            await book.save();
            res.status(201).send({ book: book });
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


//GET /books?category=categoryId  OR author=authorId
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/books", auth, async (req, res) => {
    try {
        const match = {};
        let skip = req.query.skip ? parseInt(req.query.skip) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const categoryQuery = req.query.category;
        const authorQuery = req.query.author;
        if (categoryQuery) {
            match.category = req.query.category;
        }
        if (authorQuery) {
            match.author = req.query.author;
        }
        const sortBy = req.query.sortBy;
        const sort = {};
        if (sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = (parts[1] === "desc" ? -1 : 1);
        }
        const books = await Book.find(match).skip(skip).limit(limit).sort(sort).populate("category author").exec();
        res.send(books);
    } catch {
        res.status(500).send();
    }
});

router.get("/books/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const book = await Book.findOne({ _id }).populate("category author").exec();
    try {
        if (!book) {
            res.status(404).send({ error: "Resource not found!" });
            return;
        }
        res.status(200).send(book);
    } catch {
        res.status(500).send();
    }
});

router.patch("/books/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const bookUpdateList = Object.keys(req.body);
        const allowedUpdatesList = ["bookName", "category", 'author'];
        const validUpdate = bookUpdateList.every((update) => {
            return allowedUpdatesList.includes(update);
        });
        if (!validUpdate) {
            res.status(400).send({ error: "Invalid update parameters!" });
            return;
        }
        try {
            //const taskDocToUpdate = await Task.findById(req.params.id);
            const bookDocToUpdate = await Book.findOne({ _id: req.params.id });
            if (!bookDocToUpdate) {
                res.status(404).send();
                return;
            }
            bookUpdateList.forEach((update) => {
                bookDocToUpdate[update] = req.body[update];
            });
            await bookDocToUpdate.save();
            res.send(bookDocToUpdate);
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});

router.delete("/books/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const _id = req.params.id;
        try {
            const deletedBook = await Book.findOneAndDelete({ _id });
            if (!deletedBook) {
                res.status(404).send({ error: "Book not found!" });
                return;
            }
            res.send(deletedBook);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});


module.exports = router;