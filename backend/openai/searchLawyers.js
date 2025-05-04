const Lawyer = require('../models/Lawyer');
const extractDetailsWithMistral = require('./extractDetailsWithMistral');

async function searchLawyers(userQuery) {
  const { specialization, budget } = await extractDetailsWithMistral(userQuery);

  let query = {};

  if (specialization) {
    query.specialization = specialization;
  }

  if (budget) {
    query.feePerCase = { $lte: budget };
  }
  console.log('Query:', query);
  const lawyers = await Lawyer.find(query).sort({ rating: -1, experience: -1 });
  return {
    extractedDetails: { specialization, budget },
    lawyers
  };
}

module.exports = searchLawyers;
