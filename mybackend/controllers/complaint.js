const path = require("path");

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Complaints = require("../models/Complaint");
const Citizen = require("../models/citizen");
const Category = require("../models/Category");

// @desc      Get Complaints
// @route     GET /api/v1/complaints
// @route     GET /api/v1/citizens/citizensId/complaints
// @access    Public
exports.getComplaints = asyncHandler(async (req, res, next) => {

  console.log('in Get Products')
  if (req.params.citizenId) {
    const complaints = await Complaint.find({ citizen: req.params.citizenId });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});
// exports.getcomplaints = asyncHandler(async (req, res, next) => {
//   if (req.params.citizenId) {
//     const complaints = await complaints.findById({ citizen: req.params.citizenId });

//     return res.status(200).json({
//       success: true,
//       count: complaints.length,
//       data: complaints,
//     });
//   } else {
//     res.status(200).json(res.advancedResults);
//   }
// });

// @desc      Get single complaint
// @route     GET api/v1/citizens/citizensId/complaints/complaintId
// @access    Public
exports.getComplaint = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.complaintId)
    .populate({
      path: "category",
    })
    .populate({ path: "citizen" });

  if (!complaint) {
    return next(
      new ErrorResponse(`No complaint with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// @desc      Add complaint
// @route     POST api/v1/citizens/citizensId/complaints
// @access    Private
exports.addComplaint = asyncHandler(async (req, res, next) => {
  // req.body.citizen = req.params.citizenId;
  req.body.user = req.user.id;

  const citizen = await citizen.findOne({ user: req.user.id });

  if (!citizen) {
    return next(
      new ErrorResponse(`No citizen with the id of ${req.params.citizenId}`),
      404
    );
  }

  // Make sure user is complaint owner
  if (citizen.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a complaint by ${citizen._id}`,
        401
      )
    );
  }

  const category = await Category.findById(req.body.category);
  req.body.citizen = citizen.id;
  req.body.catname = category.catname;
  const complaint = await Complaint.create(req.body);

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// @desc      Update complaint
// @route     PUT /api/v1/citizens/citizensId/complaints/complaintId
// @access    Private
exports.updateComplaint = asyncHandler(async (req, res, next) => {
  let complaint = await await Complaint.findById(req.params.complaintId);

  if (!complaint) {
    return next(
      new ErrorResponse(`No complaint with the id of ${req.params.complaintId}`),
      404
    );
  }

  // Make sure user is complaint owner
  if (complaint.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update complaint ${complaint._id}`,
        401
      )
    );
  }

  complaint= await Complaint.findByIdAndUpdate(req.params.complaintId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// @desc      Delete complaint
// @route     DELETE /api/v1/citizens/citizensId/complaints/complaintId
// @access    Private
exports.deleteComplaint = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.complaintId);

  if (!complaint) {
    return next(
      new ErrorResponse(`No complaint with the id of ${req.params.complaintId}`),
      404
    );
  }

  // Make sure user is complaint owner
  if (complaint.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete complaint ${complaint._id}`,
        401
      )
    );
  }

  await complaint.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Upload photo for complaint
// @route     PUT /api/v1/citizens/:citizensId/complaints/:complaintId/photo
// @access    Private
exports.complaintPhotoUpload = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.complaintId);

  if (!complaint) {
    return next(
      new ErrorResponse(`complaints not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is complaint owner
  if (complaint.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this complaint`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  let file = [];
  for (let i = 0; i < req.files.files.length; i++) {
    file[i] = req.files.files[i];

    // Make sure the image is a photo
    if (!file[i].mimetype.startsWith("image")) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file[i].size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
    name = file[i].name;
    // Create custom filename
    file[i].name = `photo_${complaint.id}${name}`;

    file[i].mv(
      `${process.env.FILE_UPLOAD_PATH_ITEMS}/${file[i].name}`,
      async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        console.log(file[i].name);
      }
    );
  }
  await Complaint.findByIdAndUpdate(req.params.id, {
    photo: file,
  });
  res.status(200).json({
    success: true,
    count: req.files.files.length,
    data: file,
  });

  //   res.status(200).json({
  //     success: true,
  //     data: file.name,
  //   });
  // });
});
