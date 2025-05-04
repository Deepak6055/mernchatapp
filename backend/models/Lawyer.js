const mongoose = require("mongoose");

const lawyerModel = mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    specialization: { type: String, trim: true },
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    profilePicture: { type: String, trim: true },
    feePerCase: { type: Number, required: true ,default: 0},
  },
  { timestamps: true }
);
const Lawyer = mongoose.model("Lawyer", lawyerModel);
module.exports = Lawyer;