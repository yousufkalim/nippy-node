const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const effectSchema = new Schema({
  image: {
    type: String,
  },
});

module.exports = mongoose.model(STRINGS.MODALS.EFFECT, effectSchema);
