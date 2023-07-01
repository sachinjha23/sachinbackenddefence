const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    thumbnail: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    video_url: {
        type: String,
        required: false
    },
    create_at: { type: Date, default: Date.now }
});

const Course = mongoose.model("Coursevideo", courseSchema);
module.exports = Course;
