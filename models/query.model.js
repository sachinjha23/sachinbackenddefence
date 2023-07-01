const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const querySchema = new Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    querydetails: {
        type: String,
        required: false
    },
    create_at: {
        type: Date,
        default: new Date(),
    }
});

const queryModel = mongoose.model("Query", querySchema);
module.exports = queryModel;
