// backend/routes/health.js
const express = require('express');
const router = express.Router();

// backend/routes/ai.js - Add this route
router.get('/health', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({
        status: 'error',
        message: 'Gemini API key not configured in backend'
      });
    }

    // Optional: Test the API key with a simple request
    const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello' }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });

    if (testResponse.ok) {
      res.json({
        status: 'ok',
        message: 'Backend and Gemini API are working properly'
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'Gemini API is not responding correctly'
      });
    }
    
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Backend service error: ' + error.message
    });
  }
});

module.exports = router;