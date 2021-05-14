const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid!");
            }
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (validator.contains(value, "password")) {
                throw new Error('Password can\'t contain \'password\'!');
            }
        }
    },
    isAdmin: {
        type: Boolean,
        default: false,
        require: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// adding a new method called getAuthToken() to be accessed as an instance method
userSchema.methods.getAuthToken = async function () {
    const user = this;
    // console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);     // note that the returned value is a string
    user.tokens.push({ token });
    await user.save();
    return token;
};

// this method will make res.send(user) returns the user without mongoose data, also without properties we choose to hide (delete from a copy)
userSchema.methods.toJSON = function () {
    const userProfile = this.toObject();
    delete userProfile.password;
    delete userProfile.tokens
    delete userProfile.avatar;
    return userProfile;
};

// adding a new method called findByCredentials() to be accessed as a static model method 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });    // if an exception is thrown, it will be caught when the method is called
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!user || !isPasswordMatch) {
        throw new Error("login failed!");
    }
    return user;
};

//adding middleware functions to the schema
userSchema.pre("save", async function (next) {
    const userDocument = this;
    if (userDocument.isModified("password")) {
        userDocument.password = await bcryptjs.hash(userDocument.password, 8);
    }
    next();
});

// defining model for users table
const User = mongoose.model("User", userSchema);

module.exports = User;