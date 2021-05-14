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


//GET /tasks?completed=true
//&limit=2
//&skip=1
//&sortBy=createdAt:asc || desc
router.get("/authors", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
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
    } else {
        res.status(403).send({ error: "forbidden " });
    }
});

router.get("/authors/:id", auth, async (req, res) => {
    if (req.authorizedUser.isAdmin) {
        const _id = req.params.id;
        const author = await Author.findOne({ _id });
        try {
            if (!author) {
                res.status(404).send();
                return;
            }
            res.status(200).send(author);
        } catch {
            res.status(500).send();
        }
    } else {
        res.status(403).send({ error: "forbidden " });
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

// router.post("/users/login", async (req, res) => {
//     try {
//         const user = await User.findByCredentials(
//             req.body.email,
//             req.body.password
//         );
//         console.log(user);
//         const token = await user.getAuthToken();
//         res.send({ user, token });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// router.post("/users/logout", auth, async (req, res) => {
//     try {
//         // Deleting the token from the database
//         req.authorizedUser.tokens = req.authorizedUser.tokens.filter((tokenObj) => {
//             // note that tokenObj is an object with a token key whose value is a string
//             return tokenObj.token !== req.token;
//         });
//         await req.authorizedUser.save();
//         res.send();
//     } catch (error) {
//         res.status(500).send();
//     }
// });

// router.post("/users/logoutAll", auth, async (req, res) => {
//     try {
//         req.authorizedUser.tokens = [];
//         await req.authorizedUser.save();
//         res.send();
//     } catch (error) {
//         res.status(500).send();
//     }
// });

// router.get("/users/me", auth, async (req, res) => {
//     res.send(req.authorizedUser);
// });

// router.patch("/users/me", auth, async (req, res) => {
//     const userUpdatesList = Object.keys(req.body);
//     const allowedUpdatesList = ["name", "age", "email", "password"];
//     const validUpdate = userUpdatesList.every((update) => {
//         return allowedUpdatesList.includes(update);
//     });
//     if (!validUpdate) {
//         res.status(400).send({ error: "Invalid update parameters!" });
//         return;
//     }
//     try {
//         const userDocToUpdate = req.authorizedUser;
//         userUpdatesList.forEach((update) => {
//             userDocToUpdate[update] = req.body[update];
//         });
//         await userDocToUpdate.save();
//         //const userDocToUpdate = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
//         //would have worked, but findByIdAndUpdate() bypasses the mongoose middleware checks
//         res.send(userDocToUpdate);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// router.delete("/users/me", auth, async (req, res) => {
//     try {
//         await req.authorizedUser.remove();
//         res.send(req.authorizedUser);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// //post(String_path, express_auth_function, multer_auth_function, function_ofRouting, function_handlingError)       so 5 arguments
// router.post(
//     "/users/me/avatar",
//     auth,
//     uplaoadAvatars.single("avatar"),
//     async (req, res) => {
//         const imageBuffer = await sharp(req.file.buffer)
//             .resize({ width: 250, height: 250 })
//             .png()
//             .toBuffer();
//         req.authorizedUser.avatar = imageBuffer;
//         //req.authorizedUser.avatar = req.file.buffer;             // note how I have access to req.file becuase I didn't use dest property in uplaoadAvatars onject
//         await req.authorizedUser.save();
//         res.send({ status: 200 });
//     },
//     (error, req, res, next) => {
//         res
//             .status(400)
//             .send({ error: "Please Upload image that doesn't excced 1MB" });
//     }
// );

// router.delete(
//     "/users/me/avatar",
//     auth,
//     uplaoadAvatars.single("avatar"),
//     async (req, res) => {
//         req.authorizedUser.avatar = undefined;
//         await req.authorizedUser.save();
//         res.send();
//     }
// );

// // note that postman can render the image (will display it in its binary form), so use chrome
// router.get("/users/:id/avatar", async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user || !user.avatar) {
//             throw new Error("Can load image");
//         }
//         res.set("Content-Type", "image/png"); // note how we didn't have to explicitly use res.set("Content-Type", "application/json") when we were sending
//         // back out json because express does it automatically for us
//         res.send(user.avatar);
//     } catch (error) {
//         res.status(404).send({ error: error.message });
//     }
// });

module.exports = router;