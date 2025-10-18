// backend/routes/ai.js - FIXED VERSION with prompt enhancement
import express from 'express';
const router = express.Router();

// Helper functions for prompt enhancement (copy from frontend or keep in shared file)
function isGreeting(message) {
  const greetingPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening|kamusta|kumusta)/i,
    /^(what's up|whats up|sup|yo)/i,
    /^(greetings|salutations)/i
  ];
  
  return greetingPatterns.some(pattern => pattern.test(message.trim()));
}

function enhancePromptForSteps(userMessage, userName = "", options = {}) {
  const roleName = options.roleName || "Techno.ai";
  const preferTagalog = !!options.preferTagalog;
  const audience = options.audience || "student";

  if (!userMessage || typeof userMessage !== "string") {
    return `User Question: ""
Please enter your question so I can create a student-friendly step-by-step plan.`;
  }

  const usedTagalog =
    preferTagalog ||
    /\b(kumusta|kamusta|maganda|salamat|ano|paki|sana|ayusin|ayos|gawin|po|opo|tulungan)\b/i.test(userMessage);

  if (isGreeting(userMessage)) {
    const greet = usedTagalog
      ? `Hi! I'm ${roleName}${userName ? ` — ${userName}` : ""}. Kumusta? Paano kita matutulungan ngayon?`
      : `Hi! I'm ${roleName}${userName ? ` — ${userName}` : ""}. How can I help you today?`;

    return `
${greet}

Respond briefly, then guide the student through a short step-by-step plan *before coding*:

**Planning Checklist:**
1. Goal — "Ano ang expected output?"
2. Constraints — memory, time, allowed tools.
3. Prior Knowledge — e.g., HTML, JS, Python.
4. Plan — 3–6 short steps.
5. Pre-coding — tests or files needed.

After planning, proceed with the Technical Answer Layout.
`.trim();
  }

  const langNote = usedTagalog ? "Tagalog" : "English";

  return `
User Question: "${userMessage}"

**Audience:** ${audience}
**Language:** ${langNote}
**Role:** ${roleName}

You are an AI teaching assistant for BSIT students at Bestlink College. Provide clear, practical, and educational IT-focused solutions.

**OUTPUT FORMAT:**
# <Short descriptive title>

## Learning Objectives
2–3 concise BSIT-related goals.

## Summary
1–2 lines overview of the solution.

## Prerequisites
Key skills or IT concepts needed.

## Step-by-Step Guide
1. Sequential steps.
   - **Why:** purpose or concept
   - **How:** short explanation/code
   - **Verify:** how to confirm success

## Final Code
Complete, runnable example.

## Test Cases
Sample inputs and outputs.

## Common Errors
Frequent mistakes and quick fixes.

## Resources
Useful references or documentation.

Keep responses concise (under 5000 tokens), educational, and focused on real-world IT applications.

Now answer: "${userMessage}"
`.trim();
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "Gemini API key not configured on server" 
      });
    }

    // Enhance the prompt before sending to Gemini
    const enhancedMessage = enhancePromptForSteps(message, "", {
      roleName: "Techno.ai",
      audience: "student"
    });

    console.log('Original message:', message);
    console.log('Enhanced prompt:', enhancedMessage);

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: enhancedMessage
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 5000,
        temperature: 0.7,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Gemini API request failed' 
      });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      res.json({ 
        success: true, 
        response: data.candidates[0].content.parts[0].text 
      });
    } else {
      res.status(500).json({ error: "Unexpected response from Gemini API" });
    }
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;