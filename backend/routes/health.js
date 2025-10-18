// routes/ai.js
import express from 'express';
const router = express.Router();

// This creates: GET /api/ai/health
router.get('/health', (req, res) => {
  console.log('AI Health route called');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY exists:', !!apiKey);
  
  res.json({ 
    status: 'ok', 
    message: 'AI Health route is working',
    geminiConfigured: !!apiKey,
    timestamp: new Date().toISOString()
  });
});

// Add a root route for /api/ai
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI API is working',
    timestamp: new Date().toISOString()
  });
});

export default router; // ✅ Make sure this export exists