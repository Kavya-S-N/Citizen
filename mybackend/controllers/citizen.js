const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Ctizen = require("../models/Citizen");

// @desc      Get all ctizens
// @route     GET /api/v1/ctizens
// @access    Public
exports.getCtizens = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single ctizen
// @route     GET /api/v1/ctizens/:ctizenId(not working)
// @route     GET /api/v1/ctizens/ctizenId
// @access    Public
exports.getCtizen = asyncHandler(async (req, res, next) => {
  const ctizen = await Ctizen.findById(req.params.ctizenId);

  if (!ctizen) {
    return next(
      new ErrorResponse(
        `ctizen not found with id of ${req.params.ctizenId}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: ctizen });
});

// @desc      Create new ctizen
// @route     POST /api/v1/ctizens
// @access    Private
exports.createCtizen = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published ctizen
  const publishedctizen = await Ctizen.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one ctizen
  if (publishedctizen && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already  a ctizen`,
        400
      )
    );
  }

  const ctizen = await Ctizen.create(req.body);

  res.status(201).json({
    success: true,
    data: ctizen,
  });
});

// @desc      Update ctizen
// @route     PUT /api/v1/ctizen/:ctizenId
// @access    Private
exports.updateCtizen = asyncHandler(async (req, res, next) => {
  let ctizen = await Ctizen.findById(req.params.ctizenId);

  if (!ctizen) {
    return next(
      new ErrorResponse(
        `ctizen not found with id of ${req.params.ctizenId}`,
        404
      )
    );
  }

  // Make sure user is ctizen owner
  if (ctizen.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.ctizenId} is not authorized to update this ctizen`,
        401
      )
    );
  }

  ctizen = await Ctizen.findByIdAndUpdate(req.params.ctizenId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: ctizen });
});

// @desc      Delete ctizen
// @route     DELETE /api/v1/ctizen/:ctizenId
// @access    Private
exports.deleteCtizen = asyncHandler(async (req, res, next) => {
  const ctizen = await Ctizen.findById(req.params.ctizenId);

  if (!ctizen) {
    return next(
      new ErrorResponse(
        `ctizen not found with id of ${req.params.ctizenId}`,
        404
      )
    );
  }


// @desc      Get single project
// @route     GET api/v1/projects/projectId/ctizen/ctizenId
// @access    Public
// exports.getProjectctizen = asyncHandler(async (req, res, next) => {
//   const projectctizen = await ctizen.findById(req.params.ctizenId)
//     .populate({
//       path: "category",
//     })
//     .populate({ path: "project" });

//   if (!projectctizen) {
//     return next(
//       new ErrorResponse(`No project with the id of ${req.params.id}`),
//       404
//     );
//   }

//   res.status(200).json({
//     success: true,
//     data: projectctizen,
//   });
// });


  // Make sure user is ctizen owner
  if (ctizen.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.ctizenId} is not authorized to delete this ctizen`,
        401
      )
    );
  }

  ctizen.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photo for ctizen
// @route     PUT /api/v1/ctizen/:ctizenId/photoctizen
// @access    Private
exports.ctizensPhotoUpload = asyncHandler(async (req, res, next) => {
  const ctizen = await Ctizen.findById(req.params.ctizenId);

  if (!ctizen) {
    return next(
      new ErrorResponse(
        `ctizen not found with id of ${req.params.ctizenId}`,
        404
      )
    );
  }

  // Make sure user is ctizen owner
  if (ctizen.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.ctizenId} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${ctizen._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Ctizen.findByIdAndUpdate(req.params.ctizenId, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
