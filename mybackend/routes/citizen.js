const express = require("express");
const {
  getCitizens,
  getCitizen,
  createCitizen,
  updateCitizen,
  deleteCitizen,
  getComplaintCitizen,
  // getCitizensInRadius,
  citizenPhotoUpload,
} = require("../controllers/citizen");

const Citizen = require("../models/Citizen");

// Include other resource routers
const ComplaintsRouter = require("./complaint");
// const reviewRouter = require("./reviews");

const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:ctizenId/complaints", ComplaintsRouter);
// router.use("/:ctizenId/reviews", reviewRouter);

// router.route("/radius/:zipcode/:distance").get(getCitizensInRadius);

router
  .route("/:ctizenId/photo")
  .put(protect, authorize("ctizen", "admin"), ctizenPhotoUpload);

router
  .route("/")
  .get(advancedResults(Ctizen, "Complaints"), getCitizens)
  .post(protect, authorize("ctizen", "admin"), createCitizen);

router
  .route("/:ctizenId")
  .get(getCitizen)
  .put(protect, authorize("ctizen", "admin"), updateCitizen)
  .delete(protect, authorize("ctizen", "admin"), deleteCitizen);

module.exports = router;
