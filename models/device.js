const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    password: String,
    device_name: {
      type: String,
    },
    device_id: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
  });

 
module.exports = mongoose.model(STRINGS.MODALS.DEVICE, userSchema);
