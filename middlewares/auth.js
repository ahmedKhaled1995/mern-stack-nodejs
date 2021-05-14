const jwt = require("jsonwebtoken");

const User = require("../models/users")

const auth = async (req, res, next) => {
    try {
        const tokenProvided = req.header("Authorization").replace("Bearer ", "");
        const decodedUserObject = jwt.verify(tokenProvided, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decodedUserObject._id, "tokens.token": tokenProvided });
        if (!user) {
            throw new Error();
        }
        //console.log("user found---")
        req.authorizedUser = user;
        req.token = tokenProvided;
        next();
    } catch {
        res.status(401).send({ error: "Please authenticate!" });
    }
};

module.exports = auth;