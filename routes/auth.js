// Init
const router = require("express").Router();
const { Register, Login, VerifyEmail, Logout, UpdatePassword, UpdateProfile, ForgotPassword, ResetPassword, GetsingleUser, GetallUsers, ValidateToken } = require("../controllers/auth.js");
const {
  registerUserValidator,
  loginUserValidator,
  isValidated,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator, updatePasswordValidator,logoutValidator
} = require("../middleware/validators");
const auth = require("../middleware/auth");

// Routes
// register user
router.post("/register", registerUserValidator, isValidated, Register);
// login user
router.post("/login", loginUserValidator, isValidated, Login);
// verify email token
router.get("/verify/:token", VerifyEmail);
// forgot password
router.post("/forgot", forgotPasswordValidator,isValidated, ForgotPassword);
// validate reset token
router.post("/validate/:token", ValidateToken);
//set new password
router.post("/setPasssword", resetPasswordValidator,isValidated, ResetPassword);
// update profile
router.put("/update/:id", auth(), updateProfileValidator, isValidated, UpdateProfile);
// update profile password
router.put("/updatePassword/:id", auth(), updatePasswordValidator, isValidated, UpdatePassword);

// get single user
router.get("/:id", auth(), GetsingleUser);
// get all users
router.get("/", auth(), GetallUsers);

// login user
router.post("/logout",logoutValidator, isValidated, Logout);

// Export
module.exports = router;
