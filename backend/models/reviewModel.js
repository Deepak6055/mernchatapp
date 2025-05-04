const mongoose = require("mongoose");

const reviewModel = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Lawyer",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Review = mongoose.model("Review", reviewModel);
module.exports = Review;