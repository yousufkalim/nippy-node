// Init
const router = require("express").Router();
const { Register, Login, VerifyEmail ,ForgotPassword,ResetPassword} = require("../controllers/auth.js");
const {
  registerUserValidator,
  loginUserValidator,
  isValidated,
  verifyemailValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require("../middleware/validators");

// Routes
// register user
router.post("/register", registerUserValidator, isValidated, Register);
// login user
router.post("/login", loginUserValidator, isValidated, Login);
// verify email token
router.post("/verify", verifyemailValidator, isValidated, VerifyEmail);

// forgot password
router.post("/forgot", forgotPasswordValidator, isValidated, ForgotPassword);
// reset password
router.post("/reset", resetPasswordValidator, isValidated, ResetPassword);

// Export
module.exports = router;
