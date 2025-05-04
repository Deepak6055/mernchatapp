const asyncHandler = require("express-async-handler");
const Lawyer = require("../models/Lawyer")

// @desc    Create a new lawyer
// @route   POST /api/lawyers
// @access  Protected
const createLawyer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, specialization, experience, rating, reviewsCount, profilePicture, feePerCase } = req.body;

  if (!name || !email || !feePerCase) {
    res.status(400);
    throw new Error("Name, email, and fee per case are required");
  }

  const lawyerExists = await Lawyer.findOne({ email });
  if (lawyerExists) {
    res.status(400);
    throw new Error("Lawyer already exists with this email");
  }

  const lawyer = await Lawyer.create({
    name,
    email,
    phone,
    address,
    specialization,
    experience,
    rating,
    reviewsCount,
    profilePicture,
    feePerCase
  });

  res.status(201).json(lawyer);
});

// @desc    Get a lawyer by ID
// @route   GET /api/lawyers/:id
// @access  Protected
const getLawyerById = asyncHandler(async (req, res) => {
  const lawyer = await Lawyer.findById(req.params.id);
  if (lawyer) {
    res.json(lawyer);
  } else {
    res.status(404);
    throw new Error("Lawyer not found");
  }
});

// @desc    Update a lawyer
// @route   PUT /api/lawyers/:id
// @access  Protected
const updateLawyer = asyncHandler(async (req, res) => {
  const lawyer = await Lawyer.findById(req.params.id);

  if (!lawyer) {
    res.status(404);
    throw new Error("Lawyer not found");
  }

  const {
    name,
    email,
    phone,
    address,
    specialization,
    experience,
    rating,
    reviewsCount,
    profilePicture,
    feePerCase
  } = req.body;

  lawyer.name = name || lawyer.name;
  lawyer.email = email || lawyer.email;
  lawyer.phone = phone || lawyer.phone;
  lawyer.address = address || lawyer.address;
  lawyer.specialization = specialization || lawyer.specialization;
  lawyer.experience = experience ?? lawyer.experience;
  lawyer.rating = rating ?? lawyer.rating;
  lawyer.reviewsCount = reviewsCount ?? lawyer.reviewsCount;
  lawyer.profilePicture = profilePicture || lawyer.profilePicture;
  lawyer.feePerCase = feePerCase ?? lawyer.feePerCase;

  const updatedLawyer = await lawyer.save();
  res.json(updatedLawyer);
});

// @desc    Delete a lawyer
// @route   DELETE /api/lawyers/:id
// @access  Protected
const deleteLawyer = asyncHandler(async (req, res) => {
  const lawyer = await Lawyer.findById(req.params.id);

  if (!lawyer) {
    res.status(404);
    throw new Error("Lawyer not found");
  }

  await lawyer.remove();
  res.json({ message: "Lawyer removed successfully" });
});

// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Protected
const getAllLawyers = asyncHandler(async (req, res) => {
  const lawyers = await Lawyer.find({});
  res.json(lawyers);
});

module.exports = {
  createLawyer,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  getAllLawyers
};
