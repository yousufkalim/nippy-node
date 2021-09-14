const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");


const AdSchema = new Schema(
    {
        ad_name: String,
        dimension: {
            height: String,
            width: String
        },
        images: Object,
        colorSelection: Object,
        addText: Object,
        effects: Object,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });


module.exports = mongoose.model(STRINGS.MODALS.AD, AdSchema);
