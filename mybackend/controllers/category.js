const path = require("path");
const ErrorResponse = require("../utils/errorResponse");

const Category = require("../models/Category");
const Complaint = require("../models/Complaint");
const Jobs = require("../models/Jobs");

const asyncHandler = require("../middleware/async");
// @desc      Get Complaints
// @route     GET /api/v1/category/categoryId/complaints
// @access    Public
exports.getCategoryComplaint = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.find({
    category: req.params.categoryId,
  })
    .populate({
      path: "citizen",
      select: "name description",
    })
    .populate({
      path: "category",

    });

  if (!complaint) {
    return next(
      new ErrorResponse(`No complaint with the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    count: complaint.length,
    data: complaint,
  });
});

// @desc      Get jobs
// @route     GET /api/v1/category/categoryId/jobs
// @access    Public
exports.getCategoryJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Jobs.find({
    category: req.params.categoryId,
  })
    .populate({
      path: "company",
      select: "name description",
    })
    .populate({
      path: "category",
    });

  if (!jobs) {
    return next(
      new ErrorResponse(`No complaint with the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

// @desc      Get all category
// @route     GET /api/category/
// @access    Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single category
// @route     GET /api/category/category id
// @access    Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.find({ category: req.params.categoryId });

  if (!category) {
    return next(new ErrorResponse(`No category in this id`), 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      Add category
// @route     POST /api/category
// @access    Private
exports.addCategory = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published category
  const categorypublished = await Category.findOne({
    user: req.user.id,
  });

  // if (req.body.catname === categorypublished.catname) {
  //   return next(new ErrorResponse(`Same Category `, 400));
  // }
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc      Update category
// @route     PUT /api/v1/category/categoryId
// @access    Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      Delete Category
// @route     DELETE /api/category/categoryId
// @access    Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.categoryId);
    if (!category) {
      return next(
        new ErrorResponse(`No Category with id ${req.params.categoryId}`, 400)
      );
    }
    await Category.findByIdAndRemove(req.params.categoryId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
