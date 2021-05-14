const multer = require("multer");


const uplaoadAvatars = multer({
    // dest: "avatars",
    // I removed dest property because I don't want to store the avatars in a folder instead I want to access it
    // in the http router method, you can do so by using req.file
    limits: {
        fileSize: 1000000, // bytes
    },
    fileFilter: (req, file, callback) => {
        const fileName = file.originalname;
        const isValidUpload =
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png");
        if (isValidUpload) {
            callback(undefined, true); // signaling that everything went well
        } else {
            callback(new Error("Please upload an image"));
        }
    },
});

module.exports = uplaoadAvatars;