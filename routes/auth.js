// Init
const router = require("express").Router();
const { Register, Login, VerifyEmail ,ForgotPassword,ResetPassword,GetsingleUser,GetallUsers} = require("../controllers/auth.js");
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
// get single user
router.get("/:id",  GetsingleUser);
// get single user
router.get("/",  GetallUsers);
// Export
module.exports = router;
