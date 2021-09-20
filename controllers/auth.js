//Login User
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Device = require("../models/device");

const crypto = require("crypto");
const MailService = require("../services/mail.service");

const ENV = process.env;
const populateQuery = [
  {
    path: "Devices",
    populate: [
      {
        path: "Device",
      },
    ],

  },
  {
    path: "Ads",
    populate: [
      {
        path: "Ad",
      },
    ],
  }
];
// register user
exports.Register = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ email: data.email }); // check if user already exists
    if (user)
      return res.status(400).send(response(STRINGS.ERRORS.userExists, {}));
    var verifyEmailToken = Math.floor(1000 + Math.random() * 9000);
    const emailVerificationExpiresIn = Date.now() + 900000;
    const hash = await bcrypt.hash(data.password, +ENV.BCRYPT_SALT); // hashing password
    data.password = hash;
    data.verifyEmailToken = verifyEmailToken;
    data.emailVerificationExpiresIn = emailVerificationExpiresIn;

    user = await new User(data).save(); //user saved

    let emailService = new MailService();
    await emailService.requestEmailVerification(user, verifyEmailToken); //email send for verification

    res.status(200).send(response(STRINGS.TEXTS.emailSent));
  } catch (err) {
    console.log(err.message, "err.message");
    res.send(response(err.message, 400));
  }
};
// login user
exports.Login = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }).populate(populateQuery)// Check if user exist

    if (!user) return res.status(400).send(response(STRINGS.ERRORS.emailInvalid));
    if (user.status !== STRINGS.STATUS.ACTIVE) return res.status(400).send(response(STRINGS.ERRORS.userVerification)); // check user is active

    const isCorrect = await bcrypt.compare(data.password, user.password); // Check if user password is correct
    if (!isCorrect)
      return res.status(400).send(response(STRINGS.ERRORS.passwordInvalid));
    let device = await Device.findOne({
      device_name: data.device_name, //check if device exists
    });

    if (!device) {
      device = await Device.create({
        device_name: data.device_name,
        device_id: data.device_id,
      });
      user = await User.findOneAndUpdate(
        {
          _id: user.id,
        },
        {
          $push: {
            Devices: device._id,
          },
        },
        {
          new: true,
        }
      ).populate(populateQuery)
    }

    const token = await JWT.sign(
      { id: user._id, role: user.role },
      ENV.JWT_SECRET
    ); //token generation

    const result = {
      user,
      token,
    };
    res.status(200).send(response(STRINGS.TEXTS.loginSuccess, result));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
};

// verify email

exports.VerifyEmail = async (req, res) => {
  try {
    const verifyEmailToken = req.params.token

    let user = await User.findOne({ verifyEmailToken: verifyEmailToken }); // Check if token exist
    if (!user) return res.status(400).send(`<h1>${STRINGS.ERRORS.tokenInvalid}</h1>`);
    if (user.emailVerificationExpiresIn < Date.now()) return res.status(400).send(`<h1>${STRINGS.ERRORS.tokenExpired}</h1>`);  //check verfiy token expiration is greator than date.now()

    user = await User.findOneAndUpdate(
      {
        verifyEmailToken: verifyEmailToken,
      },
      {
        $set: {
          status: STRINGS.STATUS.ACTIVE,
          verifyEmailToken: 0,
          emailVerificationExpiresIn: Date.now()
        },
      },
      {
        new: true,
      }
    );
    res
      .status(200)
      .send(`<h1>${STRINGS.TEXTS.userValidated}</h1>`);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.message);
  }
};

// forgot password

exports.ForgotPassword = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }); // Check if user exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    if (user.status !== STRINGS.STATUS.ACTIVE) return res.status(400).send(response(STRINGS.ERRORS.userVerification)); // check user is active
    var resetPasswordToken = Math.floor(1000 + Math.random() * 9000)
    const resetPasswordExpires = Date.now() + 900000;

    user = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: {
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: resetPasswordExpires,
        },
      },
      {
        new: true,
      }
    ).populate(populateQuery);
    let emailService = new MailService();
    await emailService.sendForgotPasswordEmail(user, resetPasswordToken); //email send for verification

    res.status(200).send(response(STRINGS.TEXTS.emailSent));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
};

// reset password
exports.ResetPassword = async (req, res) => {
  try {
    const { resetPasswordToken, password } = req.body;
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.tokenInvalid));
    if (user.resetPasswordExpires < Date.now()) return res.status(400).send(response(STRINGS.ERRORS.tokenExpired));  //check reset token expiration is greator than date.now()

    const salt = bcrypt.genSaltSync(15);
    const hash = await bcrypt.hash(password, salt);
    user = await User.findOneAndUpdate(
      {
        resetPasswordToken: resetPasswordToken,
      },
      {
        $set: {
          password: hash,
        },
      }
    ).populate(populateQuery);
    res
      .status(200)
      .send(response(STRINGS.TEXTS.passwordUpdated, user));
  } catch (err) {
    console.log(err.message);
    res.status(400).send(response(err.message));
  }
}
// validate token
exports.ValidateToken = async (req, res) => {
  try {
    const resetPasswordToken = req.params.token
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.tokenInvalid));
    if (user.resetPasswordExpires < Date.now()) return res.status(400).send(response(STRINGS.ERRORS.tokenExpired));  //check reset token expiration is greator than date.now()

    res
      .status(200)
      .send(response(STRINGS.TEXTS.tokenValidated, resetPasswordToken));
  } catch (err) {
    console.log(err.message);
    res.status(400).send(response(err.message));
  } 
}

//Get single User

exports.GetsingleUser = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id }).populate(populateQuery); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    res
      .status(200)
      .send(response(STRINGS.TEXTS.userFetched, user));
  } catch (error) {
    res.status(400).send(response(error.message));
  }
};

//Get all Users

exports.GetallUsers = async (req, res) => {
  try {
 
    let users = await User.find({}).populate(populateQuery); // get all users
    res
      .status(200)
      .send(response(STRINGS.TEXTS.userFetched, users));
  } catch (error) {
    res.status(400).send(response(error.message));
  }
};

// update profile
exports.UpdateProfile = async (req, res) => {
  try {
    const data = req.body;
    let userId = req.params.id
    let user = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          address: data.address,
        },
      },
      {
        new: true
      }
    ).populate(populateQuery);
    res.status(200).send(response(STRINGS.TEXTS.profileUpdated, user));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
};

// update password
exports.UpdatePassword = async (req, res) => {
  try {

    const data = req.body;
    let userId = req.params.id;
    let oldPassword = data.old_password;
    let newPassword = data.new_password;
    let user = await User.findOne({ _id: req.params.id }); // Check if token exist
    if (!user)
      return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    // Check if user password is correct
    const isCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrect)
      return res.status(400).send(response(STRINGS.ERRORS.oldpasswordInvalid));
    const hash = await bcrypt.hash(newPassword, +ENV.BCRYPT_SALT); // hashing password

    user = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          password: hash,
        },
      }, {
      new: true
    }
    ).populate(populateQuery);

    res.status(200).send(response(STRINGS.TEXTS.profileUpdated, user));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
};

// logout user
exports.Logout = async (req, res) => {
  try {
    let device_id = req.body.device_id;
    let userId = req.body.user_id;

    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $pull: {
          Devices: device_id,
        },
      },
      {
        new: true,
      }
    );
    await Device.findByIdAndRemove(device_id)
    res.status(200).send(response(STRINGS.TEXTS.userLogout));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
};
