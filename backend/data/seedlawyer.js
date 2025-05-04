const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Lawyer = require("../models/Lawyer");
const Review = require("../models/reviewModel");
const { faker } = require("@faker-js/faker"); // Updated faker import

dotenv.config({ path: "../.env" });

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Generate random lawyers
    const lawyers = [];
    for (let i = 0; i < 10; i++) {
      lawyers.push({
        name: faker.person.fullName(), // Updated to use faker.person.fullName
        email: faker.internet.email(),
        phone: faker.phone.number(), // Updated to use faker.phone.number
        address: faker.location.streetAddress(), // Updated to use faker.location.streetAddress
        specialization: faker.helpers.arrayElement([
          "Criminal Law",
          "Family Law",
          "Environmental Law",
          "Intellectual Property",
          "Corporate Law",
          "Civil Law",
          "Tax Law",
          "Labor Law",
          "Real Estate Law",
        ]),
        experience: faker.number.int({ min: 1, max: 30 }), // Updated to use faker.number.int
        rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }), // Updated to use faker.number.float
        reviewsCount: faker.number.int({ min: 5, max: 50 }), // Updated to use faker.number.int
        profilePicture: faker.image.avatar(),
        feePerCase: faker.number.int({ min: 5000, max: 50000 }), // Updated to use faker.number.int
      });
    }

    const createdLawyers = await Lawyer.insertMany(lawyers);

    // Generate random reviews for each lawyer
    const reviews = [];
    createdLawyers.forEach((lawyer) => {
      const numReviews = faker.number.int({ min: 5, max: 20 }); // Updated to use faker.number.int
      for (let i = 0; i < numReviews; i++) {
        reviews.push({
          user: faker.helpers.arrayElement([
            "680b9567b8b58c261b6ed505", // User ID: Test
            "680b99b9b8b58c261b6ed506",
            "680c5bc28db57a040371e462", // User ID: Deepak
            "6814bca11a83b8d3868d11d8",
          ]),
          lawyer: lawyer._id,
          rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }), // Updated to use faker.number.float
          comment: faker.lorem.sentence(),
        });
      }
    });

    await Review.insertMany(reviews);

    console.log("Random lawyers and reviews added successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

console.log("Seeding random lawyers and reviews...");
seedData();
