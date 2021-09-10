// Init
const router = require("express").Router();
const { Register, Login, VerifyEmail,Logout, UpdatePassword,UpdateProfile,ForgotPassword,ResetPassword,GetsingleUser,GetallUsers} = require("../controllers/auth.js");
const {
  registerUserValidator,
  loginUserValidator,
  isValidated,
  verifyemailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,updatePasswordValidator
} = require("../middleware/validators");
const auth  = require("../middleware/auth");

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
// update profile
router.put("/update/:id",auth(), updateProfileValidator, isValidated, UpdateProfile);
// update password
router.put("/updatePassword/:id",auth(), updatePasswordValidator, isValidated, UpdatePassword);
// get single user
router.get("/:id",auth(),  GetsingleUser);
// get single user
router.get("/", auth(),  GetallUsers);

// login user
router.post("/logout",  Logout);

// Export
module.exports = router;
