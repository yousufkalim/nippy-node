// Init
const router = require("express").Router();
const { Register, Login, VerifyEmail } = require("../controllers/auth.js");
const {
  registerUserValidator,
  loginUserValidator,
  isValidated,
  verifyemailValidator
} = require("../middleware/validators");

// Routes
// register user
router.post("/register", registerUserValidator, isValidated, Register);
// login user
router.post("/login", loginUserValidator, isValidated, Login);
// verify email token
router.post("/verify", verifyemailValidator, isValidated, VerifyEmail);

// Export
module.exports = router;
