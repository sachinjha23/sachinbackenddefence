const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
    },
    password: {
        type: String,
        required: true
    },
    contactnumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15
    },
    classstandard: {
        type: String,
        required: true
    },
    stream: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
