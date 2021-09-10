// Init
const router = require("express").Router();

// All Routes
router.use("/auth", require("./auth"));

// Export
module.exports = router;
