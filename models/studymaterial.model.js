const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studymaterialSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pdf_link: {
        type: String,
        required: false
    },
    create_at: { type: Date, default: Date.now }
});

const studyMaterial = mongoose.model("Studymaterial", studymaterialSchema);
module.exports = studyMaterial;
