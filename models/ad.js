const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const AdSchema = new Schema(
  {
    ad_name: String,
    dimension: {
      height: String,
      width: String,
    },
    images: Object,
    colorSelection: Object,
    addText: Object,
    effects: Object,
    media: Object,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.AD, AdSchema);
