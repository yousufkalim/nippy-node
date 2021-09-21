// Init
const router = require("express").Router();

// All Routes
router.use("/auth", require("./auth"));
router.use("/ad", require("./ad"));

// Export
module.exports = router;
