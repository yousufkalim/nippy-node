// Init
const router = require("express").Router();
const {
  createAd,
  updateAd,
  getSingleAd,
  getAllAdsByUser,
  deleteAdByUser,
} = require("../controllers/ad.js");

const auth = require("../middleware/auth");

// create Ad
router.post("/create", auth(), createAd);
// update Ad
router.put("/update/:id", auth(), updateAd);
// get single Ad
router.get("/:id", auth(), getSingleAd);
// get All Ads By User
router.get("/", auth(), getAllAdsByUser);
// delete Ad By User
router.delete("/:id", auth(), deleteAdByUser);
// Export
module.exports = router;
