const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    password: String,
    email: {
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
      restPasswordExpires: Date,
      verifyEmailToken: String,
      emailVerificationExpiresIn: Date,
  });

 
module.exports = mongoose.model(STRINGS.MODALS.USER, userSchema);
