//Login User
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");

const ENV = process.env;

// register user
exports.Register = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ email: data.email }); // check if user already exists
    if (user) return res.status(400).send(response(STRINGS.ERRORS.userExists, {}));
   
      const hash = await bcrypt.hash(data.password, +ENV.BCRYPT_SALT); // hashing password
      const buf = crypto.randomBytes(20);
        var verifyEmailToken = buf.toString("hex");
        const emailVerificationExpiresIn = Date.now() + 900000;
        data.password = hash;
        data.verifyEmailToken = verifyEmailToken;
        data.emailVerificationExpiresIn = emailVerificationExpiresIn;
      user = await new User(data).save(); //user saved
      res.status(200).send(response(STRINGS.TEXTS.userCreated, user));
  
  } catch (err) {
    console.log(err.message,"err.message")
    res.send(response(err.message, 400));
  }
};
// login user
exports.Login = async (req, res) => {
  try {
    const data = req.body;
    
    const user = await User.findOne({ email: data.email }); // Check if user exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.emailInvalid));
    const activeUser = await User.findOne({ status: STRINGS.STATUS.ACTIVE }); // Check if user active
   
    if (!activeUser) return res.status(400).send(response(STRINGS.ERRORS.userVerification));
   
    const isCorrect = await bcrypt.compare(data.password, user.password); // Check if user password is correct
    if (!isCorrect)
     return res.status(400).send(response(STRINGS.ERRORS.passwordInvalid));
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
    const { verifyEmailToken }=req.body
    let user = await User.findOne({ verifyEmailToken: verifyEmailToken }); // Check if token exist
    if (!user) return res.status(400).send(response(STRINGS.ERRORS.tokenInvalid));
    let tokenExpires=await User.findOne(
      {
        verifyEmailToken: verifyEmailToken,
        emailVerificationExpiresIn: {       
          $gt: Date.now(),        //check verfiy token expiration is greator than date.now()
        },  
      })
    if (!tokenExpires) return res.status(400).send(response(STRINGS.ERRORS.tokenIExpired));

       user =  await User.findOneAndUpdate(
      {
        verifyEmailToken: verifyEmailToken,
      },
      {
        $set: {
          status: STRINGS.STATUS.ACTIVE,
        },
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

