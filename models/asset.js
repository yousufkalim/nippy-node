const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const assetSchema = new Schema({
  screenName: {
    type: String,
  },
  image: {
    type: String,
  },
  name: {
    type: String,
  },
  data: Object,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model(STRINGS.MODALS.ASSET, assetSchema);
