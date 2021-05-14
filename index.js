const express = require("express");
const mongoose = require("mongoose");

// Importing routes
const userRouter = require("./routes/users");
const authorRouter = require("./routes/authors");
// const ratingRouter = require("./routes/ratings");

// Database connection
mongoose.connect("mongodb://localhost:27017/myRead", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) return console.log(err);
    console.log("Connected to database.");
});

// Starting express app
const port = process.env.PORT || 3000;
const app = express();

// Using routes and middlewares
app.use(express.json());
app.use(userRouter);
app.use(authorRouter);
// app.use(ratingRouter);

// Test route (For debugging only)
app.get('/', (req, res) => {
    res.send('Hello World from ITI!')
});

// Starting the server
app.listen(port, (err) => {
    if (err) return console.log(err);
    console.log(`Started server on port ${port}...`);
});