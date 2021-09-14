// Init
const router = require("express").Router();
const {getAllDevicesByUser} = require("../controllers/device.js");

const auth  = require("../middleware/auth");

// get All devices By User
router.get("/", auth(), getAllDevicesByUser);

// Export
module.exports = router;