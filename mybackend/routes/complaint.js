const express = require("express");

const {
  getComplaints,
  getComplaint,
  // getCitizen,
  getCategoryComplaint,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  ComplaintPhotoUpload,
} = require("../controllers/complaint");
// const reviewRouter = require("./reviews");

const Complaint = require("../models/Complaint");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");
// const CitizenRouter = require("./citizens");
// router.use("/:ComplaintId/reviews", reviewRouter);

router
  .route("/:complaintId/photo")
  .put(protect, authorize("citizen", "admin"), complaintPhotoUpload);

router
  .route("/")
  .get(
    advancedResults(Complaint, {
      path: "category",
      select: "catname",
    }),
    getComplaints
  )
  .post(protect, authorize("citizen", "admin"), addComplaint);

router
  .route("/:complaintId")
  .get(getComplaint)
  .put(protect, authorize("citizen", "admin"), updateComplaint)
  .delete(protect, authorize("citizen", "admin"), deleteComplaint);

  

module.exports = router;
