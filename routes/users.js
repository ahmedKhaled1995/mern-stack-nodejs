const express = require("express");
const sharp = require("sharp");

const User = require("../models/users");
const auth = require("../middlewares/auth");
const uplaoadAvatars = require("../helpers/uploadAvatars");


const router = new express.Router();

router.post("/users", async (req, res) => {
    const user = new User(req.body);
    // console.log("user");
    try {
        await user.save();
        const token = await user.getAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        console.log(user);
        const token = await user.getAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        // Deleting the token from the database
        req.authorizedUser.tokens = req.authorizedUser.tokens.filter((tokenObj) => {
            // note that tokenObj is an object with a token key whose value is a string
            return tokenObj.token !== req.token;
        });
        await req.authorizedUser.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.authorizedUser.tokens = [];
        await req.authorizedUser.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get("/users/me", auth, async (req, res) => {
    res.send(req.authorizedUser);
});

router.patch("/users/me", auth, async (req, res) => {
    const userUpdatesList = Object.keys(req.body);
    const allowedUpdatesList = ["name", "age", "email", "password"];
    const validUpdate = userUpdatesList.every((update) => {
        return allowedUpdatesList.includes(update);
    });
    if (!validUpdate) {
        res.status(400).send({ error: "Invalid update parameters!" });
        return;
    }
    try {
        const userDocToUpdate = req.authorizedUser;
        userUpdatesList.forEach((update) => {
            userDocToUpdate[update] = req.body[update];
        });
        await userDocToUpdate.save();
        //const userDocToUpdate = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        //would have worked, but findByIdAndUpdate() bypasses the mongoose middleware checks
        res.send(userDocToUpdate);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.authorizedUser.remove();
        res.send(req.authorizedUser);
    } catch (error) {
        res.status(500).send(error);
    }
});

//post(String_path, express_auth_function, multer_auth_function, function_ofRouting, function_handlingError)       so 5 arguments
router.post(
    "/users/me/avatar",
    auth,
    uplaoadAvatars.single("avatar"),
    async (req, res) => {
        const imageBuffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.authorizedUser.avatar = imageBuffer;
        //req.authorizedUser.avatar = req.file.buffer;             // note how I have access to req.file becuase I didn't use dest property in uplaoadAvatars onject
        await req.authorizedUser.save();
        res.send({ status: 200 });
    },
    (error, req, res, next) => {
        res
            .status(400)
            .send({ error: "Please Upload image that doesn't excced 1MB" });
    }
);

router.delete(
    "/users/me/avatar",
    auth,
    uplaoadAvatars.single("avatar"),
    async (req, res) => {
        req.authorizedUser.avatar = undefined;
        await req.authorizedUser.save();
        res.send();
    }
);

// note that postman can render the image (will display it in its binary form), so use chrome
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error("Can load image");
        }
        res.set("Content-Type", "image/png"); // note how we didn't have to explicitly use res.set("Content-Type", "application/json") when we were sending
        // back out json because express does it automatically for us
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

module.exports = router;