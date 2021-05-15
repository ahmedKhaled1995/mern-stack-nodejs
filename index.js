const express = require("express");
const mongoose = require("mongoose");

// Importing routes
const userRouter = require("./routes/users");
const authorRouter = require("./routes/authors");
const categoryRouter = require("./routes/categories");
const bookRouter = require("./routes/book");
const userBookRouter = require("./routes/userBooks");
const reviewRouter = require("./routes/reviews");
const ratingRouter = require("./routes/ratings");

// Database connection
mongoose.connect("mongodb://localhost:27017/myRead", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) return console.log(err);
    console.log("Connected to database.");
});

// Starting express app
const port = process.env.PORT || 5000;
const app = express();

// Using routes and middlewares
app.use(express.json());
app.use(userRouter);
app.use(authorRouter);
app.use(categoryRouter);
app.use(bookRouter);
app.use(userBookRouter);
app.use(reviewRouter);
app.use(ratingRouter);

// Test route (For debugging only)
app.get('/', (req, res) => {
    res.send('Hello World from ITI!')
});

// Starting the server
app.listen(port, (err) => {
    if (err) return console.log(err);
    console.log(`Started server on port ${port}...`);
});