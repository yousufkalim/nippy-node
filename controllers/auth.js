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

// register user
exports.Register = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ email: data.email }); // check if user already exists
    if (user) return res.status(400).send(response(STRINGS.ERRORS.userExists, {}));
    var verifyEmailToken = Math.floor(1000 + Math.random() * 9000)
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
    console.log(err.message, "err.message")
    res.send(response(err.message, 400));
  }
};
// login user
exports.Login = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }); // Check if user exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.emailInvalid));
    const activeUser = await User.findOne({ status: STRINGS.STATUS.ACTIVE }); // Check if user active

    if (!activeUser) return res.status(400).send(response(STRINGS.ERRORS.userVerification));

    const isCorrect = await bcrypt.compare(data.password, user.password); // Check if user password is correct
    if (!isCorrect)
      return res.status(400).send(response(STRINGS.ERRORS.passwordInvalid));
    let device = await Device.findOne({
      device_name: data.device_name  //check if device exists
    });

    if (!device) {
      device = await Device.create({ device_name: data.device_name, device_id: data.device_id });
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
          new: true
        }
      );
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
    const { verifyEmailToken } = req.body
    let user = await User.findOne({ verifyEmailToken: verifyEmailToken }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.tokenInvalid));
    let tokenExpires = await User.findOne(
      {
        verifyEmailToken: verifyEmailToken,
        emailVerificationExpiresIn: {
          $gt: Date.now(),        //check verfiy token expiration is greator than date.now()
        },
      })
    if (!tokenExpires) return res.status(400).send(response(STRINGS.ERRORS.tokenExpired));

    user = await User.findOneAndUpdate(
      {
        verifyEmailToken: verifyEmailToken,
      },
      {
        $set: {
          status: STRINGS.STATUS.ACTIVE,
        },
      },
      {
        new: true
      }
    );
    res
      .status(200)
      .send(response(STRINGS.TEXTS.userValidated, user));
  } catch (err) {
    console.log(err.message);
    res.status(400).send(response(err.message));
  }
}


// forgot password

exports.ForgotPassword = async (req, res) => {
  try {
    const data = req.body;

    let user = await User.findOne({ email: data.email }); // Check if user exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    const activeUser = await User.findOne({ status: STRINGS.STATUS.ACTIVE }); // Check if user active

    if (!activeUser) return res.status(400).send(response(STRINGS.ERRORS.userVerification));


    var resetPasswordToken = Math.floor(1000 + Math.random() * 9000)
    const restPasswordExpires = Date.now() + 900000;

    user = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: {
          resetPasswordToken: resetPasswordToken,
          restPasswordExpires: restPasswordExpires,
        },
      },
      {
        new: true
      }
    );
    let emailService = new MailService();
    await emailService.sendForgotPasswordEmail(user, resetPasswordToken); //email send for verification

    res.status(200).send(response(STRINGS.TEXTS.emailSent));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
}

// reset password
exports.ResetPassword = async (req, res) => {
  try {
    const { resetPasswordToken, password } = req.body
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.tokenInvalid));
    let tokenExpires = await User.findOne(
      {
        resetPasswordToken: resetPasswordToken,
        restPasswordExpires: {
          $gt: Date.now(),        //check verfiy token expiration is greator than date.now()
        },
      })
    if (!tokenExpires) return res.status(400).send(response(STRINGS.ERRORS.tokenIExpired));
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
    );
    res
      .status(200)
      .send(response(STRINGS.TEXTS.passwordUpdated, user));
  } catch (err) {
    console.log(err.message);
    res.status(400).send(response(err.message));
  }
}

//Get single User

exports.GetsingleUser = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    res
      .status(200)
      .send(response(STRINGS.TEXTS.userFetched, user));
  } catch (error) {
    res.status(400).send(response(error.message));

  }

}

//Get all Users

exports.GetallUsers = async (req, res) => {
  try {
    console.log("hello")
    let users = await User.find({}); // get all users

    res
      .status(200)
      .send(response(STRINGS.TEXTS.userFetched, users));
  } catch (error) {
    res.status(400).send(response(error.message));

  }

}


// update profile
exports.UpdateProfile = async (req, res) => {
  try {
    const data = req.body;
    let userId = req.params.id
    user = await User.findByIdAndUpdate(
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
      }, {
      new: true
    }
    );

    res.status(200).send(response(STRINGS.TEXTS.profileUpdated, user));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
}


// update password
exports.UpdatePassword = async (req, res) => {
  try {
    const data = req.body;
    let userId = req.params.id;
    let oldPassword = data.old_password;
    let newPassword = data.new_password;
    let user = await User.findOne({ _id: req.params.id }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
    // Check if user password is correct
    const isCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrect) return res.status(400).send(response(STRINGS.ERRORS.oldpasswordInvalid));
    const hash = await bcrypt.hash(newPassword, +ENV.BCRYPT_SALT); // hashing password

    user = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          password: hash
        },
      }, {
      new: true
    }
    );

    res.status(200).send(response(STRINGS.TEXTS.profileUpdated, user));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
}

// logout user
exports.Logout = async (req, res) => {
  try {

    let device_id = req.body.device_id
    let userId = req.body.user_id

    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $pull: {
          Devices: device_id,
        },
      }, {
      new: true
    }
    );
    await Device.findByIdAndRemove(device_id )
    res.status(200).send(response(STRINGS.TEXTS.userLogout));
  } catch (error) {
    res.status(400).send(response(error.message, []));
  }
}
