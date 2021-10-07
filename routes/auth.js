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
  createAsset,
  createMedia,
  createEffect,
  getAllAssetsByUser,
  getAllMediaByUser,
  getAllEffects,
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
} = require("../middleware/validators");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer.js");

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
// create asset
router.post(
  "/createAsset",
  auth(),
  upload("/Asset", "image", "single"),
  createAsset
);

// create media
router.post(
  "/createMedia",
  auth(),
  upload("Media", "image", "single"),
  createMedia
);
// create effects
router.post(
  "/createEffect",
  auth(),
  upload("Effects", "image", "single"),
  createEffect
);
// get all assets by user
router.get("/getAllAssets", auth(), getAllAssetsByUser);
// get all media by user
router.get("/getAllMedia", auth(), getAllMediaByUser);
// get all effects
router.get("/getAllEffects", auth(), getAllEffects);
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
router.post("/upload", upload("/", "image", "single"), uploadImage);

// login user
router.post("/logout", logoutValidator, isValidated, Logout);

// Export
module.exports = router;
