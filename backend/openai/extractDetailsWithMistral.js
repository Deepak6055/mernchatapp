const axios = require('axios');

const promptTemplate = `
You are a legal query assistant.

A user asks: "{{USER_QUERY}}"

Your job is to extract two things:
1. specialization: One of ['Criminal Law', 'Family Law', 'Environmental Law', 'Intellectual Property', 'Corporate Law', 'Civil Law', 'Tax Law', 'Labor Law', 'Real Estate Law']
2. budget: numeric value in INR (integer, no currency symbol)

First, map common synonyms or case types to the correct specialization:
- defense lawyer, fraud, theft, murder → criminal
- divorce, child custody, domestic issues → family
- contracts, business disputes, corporate law → corporate
- property disputes, land issues, tenant disputes → civil

Next, infer budget even from vague phrases:
- "under 1 lakh", "less than ₹1 lakh" → budget = 100000
- "around ₹50k", "approx 50000" → budget = 50000
- "my budget is 70000" → budget = 70000

Return your answer in EXACT JSON format like this:
{
  "specialization": "criminal",
  "budget": 75000
}

If specialization is unclear, output "null"
If budget is unclear, output null

Examples:
- Query: "I need a defense lawyer for fraud case, budget 75000"
  Output: { "specialization": "Criminal Law", "budget": 75000 }

- Query: "I want help with divorce, I can spend 40000"
  Output: { "specialization": "Family Law", "budget": 40000 }

- Query: "I need a lawyer for property dispute, ₹60000 budget"
  Output: { "specialization": "Civil Law", "budget": 60000 }

- Query: "Looking for corporate lawyer, budget under ₹1 lakh"
  Output: { "specialization": "Corporate Law", "budget": 100000 }
`;

async function extractDetailsWithMistral(userQuery) {
  const prompt = promptTemplate.replace('{{USER_QUERY}}', userQuery);

  try {
    // const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
    //   model: "mistral-large-latest",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0
    // }, {
    //   headers: {
    //     'Authorization': `Bearer 1xMn9ZxYsM2k9W56gNKGE0ZlqjAhjpUd`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    let responseText = response.data.choices[0].message.content.trim();
    console.log('Mistral response:', responseText);

    // Clean the response text to ensure it is valid JSON
    responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();

    try {
      const extracted = JSON.parse(responseText);

      return {
        specialization: extracted.specialization || null,
        budget: extracted.budget || null
      };
    } catch (err) {
      console.error('Failed to parse Mistral response:', responseText);
      return { specialization: null, budget: null };
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error.response ? error.response.data : error.message);
    return { specialization: null, budget: null };
  }
}

module.exports = extractDetailsWithMistral;
