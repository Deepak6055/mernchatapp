const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const searchLawyers = require('../openai/searchLawyers');

const {
  createLawyer,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  getAllLawyers,
} = require('../controllers/lawyerControllers');

const router = express.Router();

// Search Lawyers route — MUST be before /:id routes
router.post('/search-lawyers', async (req, res) => {
  const { userQuery } = req.body;

  if (!userQuery) {
    return res.status(400).json({ error: 'userQuery is required' });
  }

  try {
    const result = await searchLawyers(userQuery);

    res.json({
      queryUnderstanding: result.extractedDetails,
      matchingLawyers: result.lawyers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process search' });
  }
});

// Create + Get All Lawyers
router.route('/')
  .post(createLawyer)
  .get(getAllLawyers);

// Get / Update / Delete by ID
router.route('/:id')
  .get(getLawyerById)
  .put(updateLawyer)
  .delete(deleteLawyer);

module.exports = router;
