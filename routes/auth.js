// Init
const router = require("express").Router();
const {
  Register,
  Login,
  verifyEmail,
  Logout,
  updatePassword,
  getAllDevicesByUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  getsingleUser,
  getallUsers,
  validateToken,
  uploadImage,
} = require("../controllers/auth.js");
const {
  registerUserValidator,
  loginUserValidator,
  isValidated,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  updatePasswordValidator,
  logoutValidator,
  uploadImageValidator,
} = require("../middleware/validators");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/multer.js");

// Routes
// register user
router.post("/register", registerUserValidator, isValidated, Register);
// login user
router.post("/login", loginUserValidator, isValidated, Login);
// verify email token
router.get("/verify/:token", verifyEmail);
// forgot password
router.post("/forgot", forgotPasswordValidator, isValidated, forgotPassword);
// validate reset token
router.post("/validate/:token", validateToken);
//set new password
router.post(
  "/setPasssword",
  resetPasswordValidator,
  isValidated,
  resetPassword
);
// update profile
router.put(
  "/update/:id",
  auth(),
  updateProfileValidator,
  isValidated,
  updateProfile
);
// update profile password
router.put(
  "/updatePassword/:id",
  auth(),
  updatePasswordValidator,
  isValidated,
  updatePassword
);

// get single user
router.get("/:id", auth(), getsingleUser);
// get all users
router.get("/", auth(), getallUsers);

// get All devices By User
router.get("/device/getAll", auth(), getAllDevicesByUser);
//upload image
router.post(
  "/upload",
  upload.single("image"),
  uploadImageValidator,
  isValidated,
  uploadImage
);

// login user
router.post("/logout", logoutValidator, isValidated, Logout);

// Export
module.exports = router;
