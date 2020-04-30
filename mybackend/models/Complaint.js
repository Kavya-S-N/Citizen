const mongoose = require("mongoose");

// "title":"", "description":"","technology":"","synopsis":"", "category":"","developers":"","duration":"","guide":"","institution":"","contact":"","email":"","price":""
const ComplaintsSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a Complaint title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  technology:{
    type: String,
    required: [true, "Please add a description"],
  },
  synopsis: {
    type: String,
    required: [true, "Please add a description"],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: [true, "Please add a category"],
  },
  developers: {
    type: String,
    required: [true, "Please add a description"],
  },
  duration: {
    type: String,
    required: [true, "Please add a description"],
  },
  guide: {
    type: String,
    required: [true, "Please add a description"],
  },
  institution: {
    type: String,
    required: [true, "Please add a description"],
  },
  contact: {
    type: String,
    maxlength: [20, "Phone number can not be longer than 20 characters"],
    required: [true, "Please add phone no"],
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    required: [true, "Please add email"],
  },
  price: {
    type: String,
    required: [true, "Please add a description"],
  },
  // rate: {
  //   type: String,
  //   required: [true, "Please add rate"],
  // },
  // stock: {
  //   type: Number,
  //   required: [true, "Please add in stock"],
  // },
  // photo: [
  //   {
  //     type: String,
  //     default: "no-photo.jpg",
  //   },
  // ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  citizen: {
    type: mongoose.Schema.ObjectId,
    ref: "Citizen",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Static method to get avg of course tuitions
ComplaintsSchema.statics.getAverageCost = async function (citizenId) {
  const obj = await this.aggregate([
    {
      $match: { citizen: citizenId },
    },
    {
      $group: {
        _id: "$citizen",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("citizen").findByIdAndUpdate(citizenId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ComplaintsSchema.post("save", function () {
  this.constructor.getAverageCost(this.citizen);
});

// Call getAverageCost before remove
ComplaintsSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.citizen);
});

module.exports = mongoose.model("Complaints", ComplaintsSchema);
