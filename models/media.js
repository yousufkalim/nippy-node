const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const mediaSchema = new Schema({
  type: {
    type: String,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  name: {
    type: String,
  },
  folder: {
    type: String,
  },
  data: Object,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model(STRINGS.MODALS.MEDIA, mediaSchema);
