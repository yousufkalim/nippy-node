// Init
const { check, validationResult } = require("express-validator");

/*
====================
Validations
====================
*/

// user register Validation
exports.registerUserValidator = [
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password min length must be 6 characters"),
  check('confirm_password', "Confirm Password is required")
    .notEmpty()
    .trim()
    .isLength({ min: 4 })
    .withMessage('Confirm Password min length must be 6 characters')
    .custom(async (confirmPassword, { req }) => {
      const password = req.body.password

      if (password !== confirmPassword) {
        throw new Error('Password and Confirm Password must be same')
      }
    }),
];

// user login Validation
exports.loginUserValidator = [
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("min length must be 6 characters"),
  check("device_name", "Device name is required.")
    .notEmpty(),
  check("device_id", "Device id is required.")
    .notEmpty(),
];

// forgot password Validation
exports.forgotPasswordValidator = [
  check("email", "Email is required.").notEmpty().isEmail().trim(),

];
// logout password Validation
exports.logoutValidator = [
  check("device_id", "Device Id is required.").notEmpty(),
  check("user_id", "Device Id is required.").notEmpty(),


];
// update profile Validation
exports.updateProfileValidator = [
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("name", "Name is required.").notEmpty().trim(),
  check("address", "Name is required.").notEmpty().trim(),
  check("phone", "Phone is required.").notEmpty().
    trim()
    .isLength({ min: 10 })
    .withMessage("min length must be 10 characters")
    .trim(),



];
// reset password Validation
exports.resetPasswordValidator = [
  check("resetPasswordToken", "resetPasswordToken is required.")
  .notEmpty()
  .trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password min length must be 6 characters"),
  check('confirm_password', "Confirm Password is required")
    .notEmpty()
    .trim()
    .isLength({ min: 4 })
    .withMessage('Confirm Password min length must be 6 characters')
    .custom(async (confirmPassword, { req }) => {
      const password = req.body.password

      if (password !== confirmPassword) {
        throw new Error('Password and Confirm Password must be same')
      }
    }),
];

// update password Validation
exports.updatePasswordValidator = [
  check("old_password", "Old Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Old Password min length must be 6 characters"),
  check("new_password", "New Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage("New Password min length must be 6 characters"),
  check('confirm_password', "Confirm Password is required")
    .notEmpty()
    .trim()
    .isLength({ min: 4 })
    .withMessage('Confirm Password min length must be 6 characters')
    .custom(async (confirmPassword, { req }) => {
      const password = req.body.new_password

      if (password !== confirmPassword) {
        throw new Error('Password and Confirm Password must be same')
      }
    }),
];


// AdValidator Validation
exports.AdValidator = [
  check("images.layout", "images layout is required.").notEmpty(),
  check("images.allIndexes", "images allIndexes is required.").notEmpty(),
  check("images.layoutIndexes", "images layoutIndexes is required.").notEmpty(),
  check("images.selectedIndex", "images selectedIndex is required.").notEmpty(),
  check("images.selectedArrayIndex", "images selectedArrayIndex is required.").notEmpty(),
  check("images.layoutData", "images layoutData is required.").notEmpty(),
  check("images.screenName", "images screenName is required.").notEmpty(),
  check("images.layoutComponentType", "images screenName is required.").notEmpty(),
  // color selection validation start
  check("colorSelection.layout", "colorSelection layout is required.").notEmpty(),
  check("colorSelection.allIndexes", "colorSelection allIndexes is required.").notEmpty(),
  check("colorSelection.layoutIndexes", "colorSelection layoutIndexes is required.").notEmpty(),
  check("colorSelection.selectedIndex", "colorSelection selectedIndex is required.").notEmpty(),
  check("colorSelection.selectedArrayIndex", "colorSelection selectedArrayIndex is required.").notEmpty(),
  check("colorSelection.layoutData", "colorSelection layoutData is required.").notEmpty(),
  check("colorSelection.screenName", "colorSelection screenName is required.").notEmpty(),
  check("colorSelection.layoutComponentType", "colorSelection screenName is required.").notEmpty(),
  //addText validation start
  check("addText.layout", "addText layout is required.").notEmpty(),
  check("addText.allIndexes", "addText allIndexes is required.").notEmpty(),
  check("addText.layoutIndexes", "addText layoutIndexes is required.").notEmpty(),
  check("addText.selectedIndex", "addText selectedIndex is required.").notEmpty(),
  check("addText.selectedArrayIndex", "addText selectedArrayIndex is required.").notEmpty(),
  check("addText.layoutData", "addText layoutData is required.").notEmpty(),
  check("addText.screenName", "addText screenName is required.").notEmpty(),
  check("addText.layoutComponentType", "addText screenName is required.").notEmpty(),
//effects validation start
check("effects.layout", "effects layout is required.").notEmpty(),
  check("effects.allIndexes", "effects allIndexes is required.").notEmpty(),
  check("effects.layoutIndexes", "effects layoutIndexes is required.").notEmpty(),
  check("effects.selectedIndex", "effects selectedIndex is required.").notEmpty(),
  check("effects.selectedArrayIndex", "effects selectedArrayIndex is required.").notEmpty(),
  check("effects.layoutData", "effects layoutData is required.").notEmpty(),
  check("effects.screenName", "effects screenName is required.").notEmpty(),
  check("effects.layoutComponentType", "effects screenName is required.").notEmpty(),
];


// Example Validation
exports.validateExample = [
  check("name", "Name is required.").notEmpty().trim(),
  check("cnic", "CNIC is required.").notEmpty().trim(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 8 }),
  check("gender", "Gender is required.").notEmpty(),
  check("role", "Role is required.").notEmpty(),
  check("number", "Number is required.").notEmpty().trim(),
];

/*
======================
Result
======================
*/
exports.isValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = errors.array()[0].msg;
    res.status(400).send({ message: message });
  } else {
    next();
  }
};


// 

// "layout",
// "allIndexes",
// "layoutIndexes",
// "selectedIndex",
// "selectedArrayIndex",
// "layoutData",
// "screenName",
// "layoutComponentType"