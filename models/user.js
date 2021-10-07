const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const userSchema = new Schema({
  password: String,
  email: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: [STRINGS.STATUS.ACTIVE, STRINGS.STATUS.INACTIVE],
    default: STRINGS.STATUS.INACTIVE,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verifyEmailToken: String,
  emailVerificationExpiresIn: Date,
});

module.exports = mongoose.model(STRINGS.MODALS.USER, userSchema);
