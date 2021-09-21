//Login User
const STRINGS = require("../utils/texts");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Device = require("../models/device");
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
  },
];
// register user
exports.Register = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ email: data.email }); // check if user already exists
    if (user)
      return res.status(404).json({ message: STRINGS.ERRORS.userExists });

    var verifyEmailToken = Math.floor(1000 + Math.random() * 9000);
    const emailVerificationExpiresIn = Date.now() + 900000;
    const hash = await bcrypt.hash(data.password, +ENV.BCRYPT_SALT); // hashing password

    data.password = hash;
    data.verifyEmailToken = verifyEmailToken;
    data.emailVerificationExpiresIn = emailVerificationExpiresIn;
    user = await new User(data).save(); //user saved

    let emailService = new MailService();
    await emailService.requestEmailVerification(user, verifyEmailToken); //email send for verification

    res.json({ message: STRINGS.TEXTS.emailSent });
  } catch (error) {
    console.log(error.message, "error.message");
    res.json({ message: error.message });
  }
};
// login user
exports.Login = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }).populate(
      populateQuery
    ); // Check if user exist

    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.emailInvalid });
    if (user.status !== STRINGS.STATUS.ACTIVE)
      return res.status(401).send({ message: STRINGS.ERRORS.userVerification }); // check user is active

    const isCorrect = await bcrypt.compare(data.password, user.password); // Check if user password is correct
    if (!isCorrect)
      return res.status(404).send({ message: STRINGS.ERRORS.passwordInvalid });
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
      ).populate(populateQuery);
    }

    const token = await JWT.sign(
      { id: user._id, role: user.role },
      ENV.JWT_SECRET
    ); //token generation

    const result = {
      user,
      token,
    };
    res.json({ message: STRINGS.TEXTS.loginSuccess, result });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

// verify email

exports.verifyEmail = async (req, res) => {
  try {
    const verifyEmailToken = req.params.token;

    let user = await User.findOne({ verifyEmailToken: verifyEmailToken }); // Check if token exist
    if (!user)
      return res.status(404).send(`<h1>${STRINGS.ERRORS.tokenInvalid}</h1>`);
    if (user.emailVerificationExpiresIn < Date.now())
      return res.status(404).send(`<h1>${STRINGS.ERRORS.tokenExpired}</h1>`); //check verfiy token expiration is greator than date.now()

    user = await User.findOneAndUpdate(
      {
        verifyEmailToken: verifyEmailToken,
      },
      {
        $set: {
          status: STRINGS.STATUS.ACTIVE,
          verifyEmailToken: 0,
          emailVerificationExpiresIn: Date.now(),
        },
      },
      {
        new: true,
      }
    );
    res.json(`<h1>${STRINGS.TEXTS.userValidated}</h1>`);
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).send(error.message);
  }
};

// forgot password

exports.forgotPassword = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }); // Check if user exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.userNotFound });
    if (user.status !== STRINGS.STATUS.ACTIVE)
      return res.status(401).send({ message: STRINGS.ERRORS.userVerification }); // check user is active
    var resetPasswordToken = Math.floor(1000 + Math.random() * 9000);
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

    res.json({ message: STRINGS.TEXTS.emailSent });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { resetPasswordToken, password } = req.body;
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }); // Check if token exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.tokenInvalid });
    if (user.resetPasswordExpires < Date.now())
      return res.status(401).send({ message: STRINGS.ERRORS.tokenExpired }); //check reset token expiration is greator than date.now()

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
    res.json({ message: STRINGS.TEXTS.passwordUpdated, user });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};
// validate token
exports.validateToken = async (req, res) => {
  try {
    const resetPasswordToken = req.params.token;
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }); // Check if token exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.tokenInvalid });
    if (user.resetPasswordExpires < Date.now())
      return res.status(404).send({ message: STRINGS.ERRORS.tokenExpired }); //check reset token expiration is greator than date.now()

    res.json({ message: STRINGS.TEXTS.tokenValidated, resetPasswordToken });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

//Get single User

exports.getsingleUser = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id }).populate(
      populateQuery
    ); // Check if user id exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.userNotFound });

    res.json({ message: STRINGS.TEXTS.userFetched, user });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

//Get all Users

exports.getallUsers = async (req, res) => {
  try {
    let users = await User.find({}).populate(populateQuery); // get all users
    res.json({ message: STRINGS.TEXTS.userFetched, users });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

// update profile
exports.updateProfile = async (req, res) => {
  try {
    const data = req.body;
    let userId = req.params.id;
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
        new: true,
      }
    ).populate(populateQuery);
    res.json({ message: STRINGS.TEXTS.profileUpdated, user });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

// update password
exports.updatePassword = async (req, res) => {
  try {
    const data = req.body;
    let userId = req.params.id;
    let oldPassword = data.old_password;
    let newPassword = data.new_password;
    let user = await User.findOne({ _id: req.params.id }); // Check if token exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.userNotFound });
    // Check if user password is correct
    const isCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrect)
      return res
        .status(404)
        .send({ message: STRINGS.ERRORS.oldpasswordInvalid });
    const hash = await bcrypt.hash(newPassword, +ENV.BCRYPT_SALT); // hashing password

    user = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          password: hash,
        },
      },
      {
        new: true,
      }
    ).populate(populateQuery);

    res.json({ message: STRINGS.TEXTS.profileUpdated, user });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

//get all Devices by user

exports.getAllDevicesByUser = async (req, res) => {
  try {
    let userId = req.user.id;
    let user = await User.findById({ _id: userId }).populate(populateQuery); // Check if user exist
    if (!user)
      return res.status(404).send({ message: STRINGS.ERRORS.userNotFound });
    return res.json({ message: STRINGS.TEXTS.adFetched, user });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};

// logout user
exports.Logout = async (req, res) => {
  try {
    let device_id = req.body.device_id;
    let userId = req.body.user_id;

    let device = await Device.findOne({ _id: device_id }); // Check if device exist

    if (!device)
      return res.status(404).send({ message: STRINGS.ERRORS.deviceNotFound });
    await Device.findByIdAndRemove(device_id); //remove device
    device = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $pull: {
          Devices: device._id,
        },
      },
      {
        new: true,
      }
    );

    res.json({ message: STRINGS.TEXTS.userLogout });
  } catch (error) {
    console.log("Error--->", error);
    res.status(500).json({ message: error.message });
  }
};
