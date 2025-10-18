import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "../assets/styles/styles.css";
import "../assets/styles/sweetalert.css";
import logo from "../assets/images/logo.png";

// Utility functions - moved inside the component file
function detectLanguage(code) {
  const patterns = {
    javascript: /(?:function|const|let|var|=>|console\.log|document\.|window\.)/i,
    python: /(?:def |import |from |print\(|if __name__|class |\.py)/i,
    java: /(?:public class|public static void|import java\.|System\.out)/i,
    html: /(?:<html|<div|<body|<head|<script|<!DOCTYPE)/i,
    css: /(?:\.[\w-]+\s*\{|#[\w-]+\s*\{|@media|background:|color:)/i,
    sql: /(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE TABLE)/i,
    php: /(?:<\?php|\$\w+|function\s+\w+|echo\s+)/i,
    cpp: /(?:#include|int main\(|std::|cout <<|cin >>)/i,
    csharp: /(?:using System|public class|static void Main|Console\.WriteLine)/i
  };
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      return lang;
    }
  }
  return 'text';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
      if (btn.getAttribute('data-copy-text') === text.substring(0, 50)) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        btn.disabled = true;
        
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('copied');
          btn.disabled = false;
        }, 2000);
      }
    });
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
    }
    document.body.removeChild(textArea);
  });
}

// Generate a short descriptive title for the user's query
function generateShortTitle(userQuestion) {
  if (!userQuestion) return "AI Response";

  // Clean question
  let q = userQuestion.trim();
  q = q.replace(/\?+$/, ""); // remove trailing question marks
  q = q.replace(/\b(how to|how do i|how can i|paano|create|make|build|do|show|write|explain)\b/gi, "").trim();

  // Capitalize main keywords
  const words = q.split(" ").filter(w => w.length > 2).slice(0, 6);
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return capitalized.join(" ") || "AI Response";
}

function highlightImportantTerms(text) {
  const importantTerms = [
    'IMPORTANT', 'NOTE', 'WARNING', 'REMEMBER', 'CRITICAL',
    'MUST', 'NEVER', 'ALWAYS', 'REQUIRED', 'ESSENTIAL', 'STEP'
  ];
  
  importantTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    text = text.replace(regex, match => 
      `<span class="highlight-term">${match}</span>`
    );
  });
  
  return text;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBotResponse(text, userQuestion) {
  const shortTitle = generateShortTitle(userQuestion);

  let formattedText = `
    <div class="response-container">
      <div class="response-header">
        <div class="response-title-container">
          <h4 class="response-title">${shortTitle}</h4>
          <div class="response-divider"></div>
        </div>
      </div>
      <div class="response-content">
  `;

  text = (text || '').replace(/\r\n/g, '\n');

  // --- handle code blocks first (placeholders) ---
  const codeBlocks = [];
  let codeBlockIndex = 0;
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
    const detectedLang = language || (typeof detectLanguage === 'function' ? detectLanguage(code) : 'text');
    const langDisplay = (detectedLang || 'text').charAt(0).toUpperCase() + (detectedLang || 'text').slice(1);
    const escapedCode = (typeof escapeHtml === 'function' ? escapeHtml(code) : escapeHtmlFallback(code)).replace(/'/g, "\\'");
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks.push(`
      <div class="code-block-wrapper">
        <div class="code-block">
          <div class="code-header">
            <span class="code-language">${escapeHtml(langDisplay)}</span>
            <button class="copy-btn" data-copy-text="${escapedCode.substring(0, 200)}" onclick="window.copyToClipboard('${escapedCode}')">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
          <div class="code-content"><pre><code class="language-${escapeHtml(detectedLang)}">${escapeHtml(code)}</code></pre></div>
        </div>
      </div>
    `);
    codeBlockIndex++;
    return placeholder;
  });

  // helper escape if escapeHtml not defined
  function escapeHtmlFallback(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }
  const _escape = typeof escapeHtml === 'function' ? escapeHtml : escapeHtmlFallback;
  const _formatInline = typeof formatInlineText === 'function' ? formatInlineText : (s => _escape(s));

  // --- list stack and helpers ---
  const lines = text.split('\n');
  let processedText = '';
  const openListStack = []; // each: { tag: 'ol'|'ul', type: 'numbered'|'bulleted' }

  function closeOneList() {
    if (openListStack.length === 0) return;
    const item = openListStack.pop();
    processedText += `</${item.tag}>`;
  }
  function closeToDepth(depth) {
    while (openListStack.length > depth) closeOneList();
  }
  function closeAllLists() {
    closeToDepth(0);
  }
  function ensureList(type, level) {
    // close deeper lists
    while (openListStack.length > level - 1) closeOneList();
    // open until reach level
    while (openListStack.length < level) {
      const tag = type === 'numbered' ? 'ol' : 'ul';
      processedText += `<${tag} class="${type}-list level-${openListStack.length + 1}">`;
      openListStack.push({ tag, type });
    }
    // if top type differs, replace it
    const top = openListStack[openListStack.length - 1];
    if (top && top.type !== type) {
      const popped = openListStack.pop();
      processedText += `</${popped.tag}>`;
      const tag = type === 'numbered' ? 'ol' : 'ul';
      processedText += `<${tag} class="${type}-list level-${openListStack.length + 1}">`;
      openListStack.push({ tag, type });
    }
  }

  // --- special state for auto-nesting simple numbered lists under the last top-level number ---
  let currentParentNumber = null;  // e.g. "2" when we saw "2. Steps:"
  let nestedCounter = 0;           // increments for 2.1, 2.2...
  let lastWasTopLevelNumber = false;
  let lastLineWasBlank = true;

  lines.forEach(rawLine => {
    // Preserve indentation for detecting bullets
    if (/^\s*$/.test(rawLine)) {
      // blank line -> break auto-nesting context but don't forcibly close open lists
      lastWasTopLevelNumber = false;
      currentParentNumber = null;
      nestedCounter = 0;
      lastLineWasBlank = true;
      return;
    }
    lastLineWasBlank = false;

    // Headings: markdown-style (#, ##)
    const headingMatch = rawLine.trim().match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeAllLists();
      const level = headingMatch[1].length;
      const content = _formatInline(headingMatch[2]);
      const hTag = level <= 2 ? 'h4' : (level === 3 ? 'h5' : 'h6');
      processedText += `<${hTag} class="response-subtitle">${content}</${hTag}>`;
      // reset auto-nesting
      currentParentNumber = null;
      nestedCounter = 0;
      lastWasTopLevelNumber = false;
      return;
    }

    // Blockquote
    const blockquoteMatch = rawLine.match(/^\s*>\s+(.*)$/);
    if (blockquoteMatch) {
      closeAllLists();
      processedText += `<blockquote class="response-quote">${_formatInline(blockquoteMatch[1])}</blockquote>`;
      currentParentNumber = null;
      nestedCounter = 0;
      lastWasTopLevelNumber = false;
      return;
    }

    // Explicit nested numbering like "1.1" or "2.3.1"
    const explicitNestedMatch = rawLine.trim().match(/^((?:\d+\.)+\d+)\s*[.)]?\s*(.*)$/);
    if (explicitNestedMatch) {
      const rawNumber = explicitNestedMatch[1].replace(/\.$/, '');
      const content = explicitNestedMatch[2] || '';
      const level = rawNumber.split('.').length;
      ensureList('numbered', level);
      processedText += `<li class="nested-item level-${level}"><span class="nested-number">${_escape(rawNumber)}</span> ${_formatInline(content)}</li>`;
      // explicit nested resets auto-parenting
      currentParentNumber = null;
      nestedCounter = 0;
      lastWasTopLevelNumber = false;
      return;
    }

    // Simple numbering (e.g., "1. Title")
    const simpleNumMatch = rawLine.match(/^\s*(\d+)\.\s*(.*)$/);
    if (simpleNumMatch) {
      const number = simpleNumMatch[1];
      const content = simpleNumMatch[2] || '';

      if (lastWasTopLevelNumber && currentParentNumber !== null) {
        // auto-nest under currentParentNumber => produce parentNumber.N sequentially
        nestedCounter++;
        ensureList('numbered', 2);
        processedText += `<li class="nested-item level-2"><span class="nested-number">${_escape(currentParentNumber + '.' + nestedCounter)}</span> ${_formatInline(content)}</li>`;
        // remain in auto-nesting mode (allow subsequent simple numbers to also nest)
        lastWasTopLevelNumber = true;
        return;
      } else {
        // treat as top-level numbered item
        ensureList('numbered', 1);
        processedText += `<li class="step-item level-1"><span class="step-number">${_escape(number)}.</span> ${_formatInline(content)}</li>`;
        // set this as possible parent for following simple-numbered lines
        currentParentNumber = number;
        nestedCounter = 0;
        lastWasTopLevelNumber = true;
        return;
      }
    }

    // Bullets (detect indentation via leading spaces)
    const bulletMatch = rawLine.match(/^(\s*)[-*]\s+(.*)$/);
    if (bulletMatch) {
      const leadingSpaces = (bulletMatch[1] || '').length;
      const content = bulletMatch[2];
      // if there's an active top-level parent number and lastWasTopLevelNumber true -> put bullets at level-2
      let level = 2;
      if (leadingSpaces >= 2) level = 3;
      ensureList('bulleted', level);
      processedText += `<li class="bullet-item level-${level}">${_formatInline(content)}</li>`;
      // bullets under a parent keep parent open (so further simple numbers become nested)
      return;
    }

    // Normal paragraph -> close lists and render paragraph
    closeAllLists();
    processedText += `<p class="response-paragraph">${_formatInline(rawLine.trim())}</p>`;
    // reset auto-nesting
    currentParentNumber = null;
    nestedCounter = 0;
    lastWasTopLevelNumber = false;
  });

  closeAllLists();

  processedText = (typeof highlightImportantTerms === 'function') ? highlightImportantTerms(processedText) : processedText;

  formattedText += processedText + '</div></div>';

  // Replace code block placeholders back
  codeBlocks.forEach((cb, idx) => {
    formattedText = formattedText.replace(`__CODE_BLOCK_${idx}__`, cb);
  });

  return formattedText;
}

// Helper function to format inline text (bold, italic)
function formatInlineText(text) {
  return text
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>');
}

// Utility to get initials if no picture
function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Function to check if message is a greeting
function isGreeting(message) {
  const greetingPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening|kamusta|kumusta)/i,
    /^(what's up|whats up|sup|yo)/i,
    /^(greetings|salutations)/i
  ];
  
  return greetingPatterns.some(pattern => pattern.test(message.trim()));
}

/*function enhancePromptForSteps(userMessage, userName = "", options = {}) {
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
1. Goal — “Ano ang expected output?”
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

if (typeof window !== "undefined") {
  window.isGreeting = isGreeting;
  window.enhancePromptForSteps = enhancePromptForSteps;
}*/


function Home({ onLogout }) {
  // Get dynamic user data from localStorage
  let user = {
    name: "John Doe",
    email: "john@example.com",
    picture: "",
  };

  try {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      const parsedUser = JSON.parse(savedUserInfo);
      user = {
        name: parsedUser.full_name || parsedUser.name || "John Doe",
        email: parsedUser.email || "john@example.com",
        picture: parsedUser.profile || parsedUser.picture || "",
      };
    }
  } catch (error) {
    console.error("Error parsing user info:", error);
  }

  const firstName = user.name.split(" ")[0];
  const fullName = user.name || user.email;
  const initials = getInitials(fullName);

  // States
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Chat conversation states
  const [conversationTitles, setConversationTitles] = useState([]);
  const [currentChatTitle, setCurrentChatTitle] = useState("Welcome Chat");
  const [currentSequence, setCurrentSequence] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Refs
  const userProfileRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Make copyToClipboard available globally for the onclick handlers
  useEffect(() => {
    // Make copyToClipboard available globally for the onclick handler
    window.copyToClipboard = copyToClipboard;
    
    return () => {
      // Cleanup
      delete window.copyToClipboard;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setInterimTranscript("");
      };

      recognitionInstance.onresult = (event) => {
        console.log('Speech recognition result received');
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        console.log('Final transcript:', finalTranscript);
        console.log('Interim transcript:', interim);

        if (finalTranscript) {
          setMessage(prev => {
            const newMessage = prev + finalTranscript + " ";
            console.log('Setting final message:', newMessage);
            return newMessage;
          });
          setInterimTranscript("");
        } else if (interim) {
          setInterimTranscript(interim);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setInterimTranscript("");
        
        if (event.error === 'not-allowed') {
          Swal.fire({
            title: 'Microphone Access Denied',
            text: 'Please allow microphone access to use voice input. Click the microphone icon and allow permission when prompted.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } else if (event.error === 'no-speech') {
          console.log('No speech detected - this is normal when starting');
          // Don't show error for no-speech, it's common when starting
        } else {
          Swal.fire({
            title: 'Voice Input Error',
            text: `Error: ${event.error}. Please try again.`,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setInterimTranscript("");
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSpeechSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Check API key on component mount
  useEffect(() => {
    checkApiKey();
    initializeUser();
    testBackendConnection();
  }, []);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend is running:', data);
      } else {
        console.error('Backend responded with error:', response.status);
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      console.error('Please make sure the backend server is running and reachable.');
    }
  };

  // Load conversation titles when userId changes
  useEffect(() => {
    if (userId) {
      loadConversationTitles();
    }
  }, [userId]);

  // Refresh conversation titles when currentChatTitle changes (after new chat)
  useEffect(() => {
    if (userId && currentChatTitle !== "Welcome Chat") {
      loadConversationTitles();
    }
  }, [currentChatTitle, userId]);

  // Initialize user ID and load conversation titles
  const initializeUser = () => {
    try {
      const savedUserInfo = localStorage.getItem("userInfo");
      if (savedUserInfo) {
        const parsedUser = JSON.parse(savedUserInfo);
        // Use email as a temporary user ID, in production you'd have a proper user ID
        const tempUserId = parsedUser.email || "temp_user_" + Date.now();
        setUserId(tempUserId);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  // Load conversation titles from database
  const loadConversationTitles = async () => {
    if (!userId) {
      console.log('No user ID available for loading conversation titles');
      return;
    }
    
    setLoadingConversations(true);
    try {
      console.log('Loading conversation titles for user:', userId);
      const response = await fetch(`${API_BASE_URL}/api/messages/titles/${encodeURIComponent(userId)}`);
      if (response.ok) {
        const titles = await response.json();
        console.log('Loaded conversation titles:', titles);
        setConversationTitles(titles);
      } else {
        console.error('Failed to load conversation titles:', response.status);
      }
    } catch (error) {
      console.error("Error loading conversation titles:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Save messages to database
  const saveMessagesToDB = async (messages) => {
    if (!userId) {
      console.error('No user ID available for saving messages');
      return;
    }
    
    try {
      console.log('Saving messages to database:', messages);
      console.log('Backend URL:', `${API_BASE_URL}/api/messages/batch`);
      
      const response = await fetch(`${API_BASE_URL}/api/messages/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const savedMessages = await response.json();
        console.log('Messages saved to database successfully:', savedMessages.length);
        console.log('Saved messages:', savedMessages);
        loadConversationTitles(); // Refresh conversation titles
      } else {
        const errorData = await response.json();
        console.error('Failed to save messages to database:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error saving messages to database:', error);
      console.error('This might mean the backend server is not running on port 5000');
    }
  };

  // Load messages for a specific chat title
  const loadChatMessages = async (title) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/chat/${encodeURIComponent(userId)}/${encodeURIComponent(title)}`);
      if (response.ok) {
        const messages = await response.json();
        console.log('Raw messages from database:', messages);
        console.log('Number of messages received:', messages.length);
        console.log('Message details:', messages.map(m => ({ 
          id: m._id, 
          sender: m.sender, 
          sequence: m.sequence, 
          content: m.content.substring(0, 50) + '...' 
        })));
        
        // Convert database messages to chat format
        const chatMessages = messages.map(msg => {
          const isUserMessage = msg.sender === userId;
          let formattedText = null;
          
          if (!isUserMessage) {
            try {
              formattedText = formatBotResponse(msg.content, "Previous conversation");
              // If formattedText is empty or just whitespace, fall back to plain text
              if (!formattedText || formattedText.trim().length === 0) {
                formattedText = null;
              }
            } catch (error) {
              console.error('Error formatting bot response:', error);
              formattedText = null;
            }
          }
          
          console.log(`Message ${msg._id}:`, {
            sender: msg.sender,
            isUserMessage,
            content: msg.content.substring(0, 50) + '...',
            hasFormattedText: !!formattedText,
            formattedTextLength: formattedText ? formattedText.length : 0
          });
          
          return {
            id: msg._id,
            text: msg.content,
            sender: isUserMessage ? "user" : "bot",
            timestamp: new Date(msg.timestamp),
            formattedText: formattedText
          };
        });
        
        console.log('Converted chat messages:', chatMessages);
        setChatMessages(chatMessages);
        setCurrentSequence(messages.length);
        console.log('Loaded chat messages:', chatMessages.length);
      } else {
        console.error('Failed to load chat messages:', response.status);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const checkApiKey = async () => {
    try {      
      // Test backend connection and API key configuration
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === 'ok') {
        setApiStatus("available");
        return true;
      } else {
        setApiStatus("unavailable");
        Swal.fire({
          title: 'Service Unavailable',
          text: data.message || 'AI service is currently unavailable. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return false;
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setApiStatus("unavailable");
      Swal.fire({
        title: 'Connection Error',
        text: 'Cannot connect to the AI service. Please make sure the backend server is running.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }
  };

  // Send message to Gemini API
  // Send message to Gemini API - FIXED VERSION
  const sendToGemini = async (userMessage) => {
    try {      
      console.log('Sending message to backend:', userMessage);
      
      // Get user info for personalization
      const savedUserInfo = localStorage.getItem("userInfo");
      let userName = "";
      if (savedUserInfo) {
        const parsedUser = JSON.parse(savedUserInfo);
        userName = parsedUser.full_name || parsedUser.name || "";
      }
      
      // Enhance the prompt using enhancePromptForSteps
      const enhancedMessage = enhancePromptForSteps(userMessage, userName, {
        roleName: "Techno.ai",
        audience: "student"
      });
      
      console.log('Enhanced prompt:', enhancedMessage);
      
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: enhancedMessage  // Send the enhanced prompt instead of raw message
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Backend API error:', data);
        throw new Error(data.error || `HTTP ${response.status}: API request failed`);
      }

      if (data.success && data.response) {
        return data.response;
      } else {
        throw new Error(data.error || "Unexpected response format from backend");
      }
      
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  // Try alternative models if the primary one fails
  const tryAlternativeModels = async (enhancedMessage, apiKey) => {
    const alternativeModels = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro"
    ];

    for (const modelName of alternativeModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
        
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

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully used model: ${modelName}`);
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
          }
        }
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error);
        continue;
      }
    }

    throw new Error("All available models failed. Please check your API key and try again later.");
  };

  // Watch theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Watch screen resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close logout dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target)) {
        setShowLogoutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((prev) => !prev);
    } else {
      const newCollapsed = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsed);
      localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
    }
  };

  // Toggle logout dropdown
  const toggleLogoutDropdown = (e) => {
    e.stopPropagation();
    setShowLogoutDropdown((prev) => !prev);
  };

  // Show logout confirmation with SweetAlert
  const showLogoutConfirmation = () => {
    Swal.fire({
      title: '<span class="logout-swal-title">Logout Confirmation</span>',
      html: '<div class="logout-swal-content">Are you sure you want to logout?</div>',
      icon: 'question',
      iconColor: 'var(--accent-primary)',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'logout-swal',
        confirmButton: 'logout-swal-confirm',
        cancelButton: 'logout-swal-cancel',
        actions: 'logout-swal-actions',
      },
      buttonsStyling: false,
      reverseButtons: true,
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
    }).then((result) => {
      if (result.isConfirmed) {
        performLogout();
      }
    });
  };

  // Perform logout actions
  const performLogout = () => {
    setShowLogoutDropdown(false);
    
    // Clear localStorage
    localStorage.removeItem("userInfo");
    localStorage.removeItem("theme");
    
    // Call parent logout handler
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login.php after a short delay
    setTimeout(() => {
      window.location.href = "login.php";
    }, 500);
  };

  // Handle logout from dropdown
  const handleLogout = () => {
    setShowLogoutDropdown(false);
    showLogoutConfirmation();
  };

  // Direct logout function (for the logout icon)
  const handleDirectLogout = () => {
    showLogoutConfirmation();
  };

  // Handle settings click
  const handleSettings = () => {
    setShowLogoutDropdown(false);
    console.log("Settings clicked");
  };

  // Voice recording functions
  const startRecording = async () => {
    if (recognition && isSpeechSupported) {
      try {
        // Request microphone permission first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately since we just needed permission
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error('Microphone permission denied:', err);
          Swal.fire({
            title: 'Microphone Access Required',
            text: 'Please allow microphone access to use voice input.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        // Start recognition
        recognition.start();
        console.log('Starting speech recognition...');
        
        // Show recording started message
        Swal.fire({
          title: 'Recording Started',
          text: 'Speak now... Click stop when finished.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        Swal.fire({
          title: 'Recording Error',
          text: 'Unable to start voice recording. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Voice Input Not Supported',
        text: 'Your browser does not support speech recognition. Please use Chrome or Edge.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      console.log('Stopping speech recognition...');
      
      // Add interim transcript to final message if any
      if (interimTranscript) {
        setMessage(prev => prev + interimTranscript + " ");
        setInterimTranscript("");
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Decide which chevron to show
  const getChevronClass = () => {
    if (window.innerWidth <= 768) {
      return sidebarOpen ? "fa-chevron-left" : "fa-chevron-right";
    } else {
      return sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left";
    }
  };

  // Chat functions
  const handleSend = async () => {
    if (!message.trim() || isTyping || apiStatus !== "available") return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsTyping(true);

    // Update chat title on first message
    let finalChatTitle = currentChatTitle;
    if (chatMessages.length === 0) {
      finalChatTitle = generateShortTitle(currentMessage);
      setCurrentChatTitle(finalChatTitle);
    }

    try {
      const aiResponse = await sendToGemini(currentMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
        formattedText: formatBotResponse(aiResponse, currentMessage)
      };

      setChatMessages((prev) => [...prev, botMessage]);

      // Save messages to database
      if (userId) {
        const messagesToSave = [
          {
            chat_title: finalChatTitle,
            sender: userId,
            content: currentMessage,
            has_code: /```[\s\S]*?```/.test(currentMessage),
            sequence: currentSequence + 1
          },
          {
            chat_title: finalChatTitle,
            sender: "bot", // Use "bot" as sender for AI responses
            content: aiResponse,
            has_code: /```[\s\S]*?```/.test(aiResponse),
            sequence: currentSequence + 2
          }
        ];
        
        console.log('About to save messages to database:', messagesToSave);
        await saveMessagesToDB(messagesToSave);
        setCurrentSequence(prev => prev + 2);
      } else {
        console.error('No userId available for saving messages');
      }
    } catch (error) {
      console.error("Error:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: "bot",
        timestamp: new Date(),
        isError: true
      };

      setChatMessages((prev) => [...prev, errorMessage]);
      
      if (error.message.includes("API key") || error.message.includes("permission") || error.message.includes("region")) {
        Swal.fire({
          title: 'API Error',
          text: error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e) => {
    const textarea = e.target;
    const wrapper = document.getElementById('chat-input-wrapper');
    
    // Reset heights
    textarea.style.height = 'auto';
    if (wrapper) wrapper.style.height = 'auto';
    
    // Calculate new heights
    const scrollHeight = textarea.scrollHeight;
    const minTextareaHeight = 24;
    const maxTextareaHeight = 120;
    const minWrapperHeight = 80;
    const maxWrapperHeight = 200;
    
    // Calculate textarea height
    const textareaHeight = Math.min(Math.max(scrollHeight, minTextareaHeight), maxTextareaHeight);
    
    // Calculate wrapper height (textarea height + padding + button area)
    const wrapperHeight = Math.min(Math.max(textareaHeight + 72, minWrapperHeight), maxWrapperHeight);
    
    // Apply heights
    textarea.style.height = `${textareaHeight}px`;
    if (wrapper) {
      wrapper.style.height = `${wrapperHeight}px`;
    }
    
    // Show scrollbar when needed
    textarea.style.overflowY = scrollHeight > maxTextareaHeight ? 'auto' : 'hidden';
  };

  // Add this useEffect to handle message changes
  useEffect(() => {
    if (message === '') {
      const textarea = document.getElementById('user-input');
      const wrapper = document.getElementById('chat-input-wrapper');
      
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.overflowY = 'hidden';
      }
      
      if (wrapper) {
        wrapper.style.height = 'auto';
      }
    }
  }, [message]);

  // Add click outside handler for chat menu dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.chat-menu')) {
        document.querySelectorAll('.chat-menu-dropdown').forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const startNewChat = () => {
    setChatMessages([]);
    setIsTyping(false);
    setCurrentSequence(0);
    setCurrentChatTitle("New Chat " + new Date().toLocaleDateString());
  };

  // Function to handle copy button clicks safely
  const handleCopyClick = (text) => {
    copyToClipboard(text);
  };

  // Function to handle copy response button clicks
  const handleCopyResponse = (text) => {
    if (text) {
      copyToClipboard(text);
      // Show success feedback
      Swal.fire({
        title: 'Copied!',
        text: 'Response copied to clipboard',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Handle conversation title click
  const handleConversationClick = (title) => {
    console.log('Loading conversation:', title);
    setCurrentChatTitle(title);
    loadChatMessages(title);
  };

  // Handle chat menu click
  const handleChatMenuClick = (title, event) => {
    // Close all other dropdowns first
    document.querySelectorAll('.chat-menu-dropdown').forEach(dropdown => {
      if (dropdown.id !== event.target.closest('.chat-menu').querySelector('.chat-menu-dropdown').id) {
        dropdown.classList.remove('show');
      }
    });
    
    // Toggle current dropdown
    const dropdown = event.target.closest('.chat-menu').querySelector('.chat-menu-dropdown');
    dropdown.classList.toggle('show');
  };

  // Handle edit chat title - inline editing
  const handleEditChatTitle = (currentTitle) => {
    // Close the dropdown menu
    document.querySelectorAll('.chat-menu-dropdown').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
    
    // Find the chat item and make title editable
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
      const titleElement = item.querySelector('.chat-title');
      if (titleElement && titleElement.textContent === currentTitle) {
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'chat-title-edit';
        input.maxLength = 50;
        
        // Replace title with input
        titleElement.style.display = 'none';
        titleElement.parentNode.insertBefore(input, titleElement);
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveTitle = async () => {
          const newTitle = input.value.trim();
          if (newTitle && newTitle !== currentTitle && newTitle.length <= 50) {
            try {
              // Update in database
              const response = await fetch(`${API_BASE_URL}/api/messages/update-title/${encodeURIComponent(userId)}/${encodeURIComponent(currentTitle)}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newTitle: newTitle })
              });
              
              if (response.ok) {
                // Update local state
                setConversationTitles(prev => 
                  prev.map(conv => 
                    conv.title === currentTitle 
                      ? { ...conv, title: newTitle }
                      : conv
                  )
                );
                
                // Update current chat title if it's the active one
                if (currentChatTitle === currentTitle) {
                  setCurrentChatTitle(newTitle);
                }
                
                // Show success message
                Swal.fire({
                  title: 'Success!',
                  text: 'Chat title updated successfully',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false,
                  toast: true,
                  position: 'top-end'
                });
              } else {
                throw new Error('Failed to update title');
              }
            } catch (error) {
              console.error('Error updating chat title:', error);
              Swal.fire({
                title: 'Error!',
                text: 'Failed to update chat title',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
              });
            }
          }
          
          // Restore title element
          titleElement.textContent = newTitle || currentTitle;
          titleElement.style.display = 'block';
          input.remove();
        };
        
        // Handle cancel on Escape
        const cancelEdit = () => {
          titleElement.style.display = 'block';
          input.remove();
        };
        
        input.addEventListener('blur', saveTitle);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveTitle();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
          }
        });
      }
    });
  };

  // Handle delete conversation
  const handleDeleteConversation = (title) => {
    Swal.fire({
      title: 'Delete Conversation',
      text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete conversation from database
          const response = await fetch(`${API_BASE_URL}/api/messages/delete-conversation/${encodeURIComponent(userId)}/${encodeURIComponent(title)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            // Update local state - remove from conversation list
            setConversationTitles(prev => 
              prev.filter(conv => conv.title !== title)
            );
            
            // If this was the active conversation, start a new chat
            if (currentChatTitle === title) {
              setChatMessages([]);
              setCurrentChatTitle("New Chat " + new Date().toLocaleDateString());
            }
            
            // Close dropdown menu
            document.querySelectorAll('.chat-menu-dropdown').forEach(dropdown => {
              dropdown.classList.remove('show');
            });
            
            Swal.fire({
              title: 'Deleted!',
              text: 'Conversation has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          } else {
            throw new Error('Failed to delete conversation');
          }
        } catch (error) {
          console.error('Error deleting conversation:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete conversation',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      }
    });
  };

  // Update chat title based on first message
  const updateChatTitle = (firstMessage) => {
    const newTitle = generateShortTitle(firstMessage);
    setCurrentChatTitle(newTitle);
  };

  return (
    <div id="app-container">
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
          sidebarOpen ? "open" : ""
        }`}
        id="sidebar"
      >
        {/* Sidebar minimizer */}
        <button className="sidebar-minimizer" onClick={toggleSidebar}>
          <i className={`fas ${getChevronClass()}`}></i>
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} className="logo-icon" alt="Techno AI Logo" />
          </div>
          <span className="logo-text">Techno.ai</span>
        </div>

        {/* New chat button */}
        <button className="new-chat-btn" onClick={startNewChat} disabled={apiStatus !== "available"}>
          <i className="fas fa-plus"></i>
          <span>New Chat</span>
        </button>

        {/* Chat history */}
        <div className="chat-history" id="chat-history">
          {loadingConversations ? (
            <div className="chat-item">
              <div className="chat-title">Loading conversations...</div>
              <div className="chat-preview">Please wait</div>
            </div>
          ) : (
            <>
              {conversationTitles.map((conversation, index) => (
                <div 
                  key={index}
                  className={`chat-item ${conversation.title === currentChatTitle ? 'active' : ''}`}
                >
                  <div 
                    className="chat-content"
                    onClick={() => handleConversationClick(conversation.title)}
                  >
                    <div className="chat-title">{conversation.title}</div>
                    <div className="chat-preview">Click to view conversation</div>
                    <div className="chat-time">
                      {new Date(conversation.lastMessage).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="chat-menu">
                    <button 
                      className="chat-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatMenuClick(conversation.title, e);
                      }}
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <div className="chat-menu-dropdown" id={`menu-${index}`}>
                      <button 
                        className="menu-item edit-item"
                        onClick={() => handleEditChatTitle(conversation.title)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit Title
                      </button>
                      <button 
                        className="menu-item delete-item"
                        onClick={() => handleDeleteConversation(conversation.title)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {conversationTitles.length === 0 && !loadingConversations && (
          <div className="chat-item active" data-chat-id="1">
            <div className="chat-title">Welcome Chat</div>
            <div className="chat-preview">How can I help you today?</div>
            <div className="chat-time">Just now</div>
          </div>
              )}
            </>
          )}
        </div>

        {/* User profile with logout dropdown and logout icon */}
        <div 
          className="user-profile" 
          ref={userProfileRef}
          style={{ cursor: 'pointer' }}
        >
          <div className="profile-content" onClick={toggleLogoutDropdown}>
            <div className="profile-avatar">
              {user.picture ? (
                <>
                  <img
                    src={user.picture}
                    alt={fullName}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="profile-avatar-fallback"
                    style={{ display: "none" }}
                  >
                    {initials}
                  </div>
                </>
              ) : (
                <div className="profile-avatar-fallback">{initials}</div>
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{fullName}</div>
              <div className="profile-status">
                <div className="status-dot"></div>
                Online
              </div>
            </div>
          </div>

          {/* Logout Icon - Always visible */}
          <button 
            className="logout-icon-btn" 
            onClick={handleDirectLogout}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>

          {/* Logout Dropdown */}
          {showLogoutDropdown && (
            <div className="logout-dropdown">
              <div className="items" onClick={handleSettings}>
                <i className="fas fa-user-cog"></i>
                <span>Settings</span>
              </div>
              <div className="items logout-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-info">
            <h2>
              <div
                className="header-minimizer"
                id="header-minimizer"
                onClick={toggleSidebar}
              >
                <i className={`fas ${getChevronClass()}`}></i>
              </div>
              Minimize
            </h2>
          </div>
          <div className="header-actions">
            <button
              className="action-btn"
              id="theme-toggle-btn"
              title="Toggle dark/light mode"
              onClick={toggleTheme}
            >
              <i className={`fas ${theme === "dark" ? "fa-moon" : "fa-sun"}`} />
            </button>
          </div>
        </div>

        {/* Chat Box */}
        <div id="chat-box" ref={chatBoxRef}>
          {chatMessages.length === 0 && !isTyping ? (
            <div className="welcome-message">
              <div className="welcome-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>Welcome to Techno.ai, {firstName}!</h3>
              <p>
                {apiStatus === "available" 
                  ? "I'm here to help you with step-by-step solutions, coding guidance, and detailed explanations. Ask me anything and I'll break it down for you!"
                  : "Please configure your Gemini API key to start chatting."}
              </p>
              
            </div>
          ) : (
            <div className="messages-container">
              {chatMessages.map((msg) => {
                console.log('Rendering message:', {
                  id: msg.id,
                  sender: msg.sender,
                  hasFormattedText: !!msg.formattedText,
                  textLength: msg.text ? msg.text.length : 0,
                  formattedTextLength: msg.formattedText ? msg.formattedText.length : 0
                });
                return (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender}-message ${msg.isError ? 'error-message' : ''}`}
                >
                  {msg.sender === "bot" && msg.formattedText ? (
                    <div className="bot-message-content">
                      <div 
                        dangerouslySetInnerHTML={{ __html: msg.formattedText }}
                        onClick={(e) => {
                          // Handle copy button clicks within the formatted text
                          if (e.target.classList.contains('copy-btn')) {
                            const copyText = e.target.getAttribute('data-copy-text');
                            if (copyText) {
                              handleCopyClick(copyText);
                            }
                          }
                        }}
                      />
                      <div className="bot-message-actions">
                        <button 
                          className="msg-action-btn msg-copy-btn" 
                          title="Copy response"
                          onClick={() => {
                            handleCopyResponse(msg.text);
                          }}
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                        <button 
                          className="msg-action-btn msg-like-btn" 
                          title="Like response"
                          onClick={() => {
                            // Like functionality will be added later
                            console.log('Like clicked for bot message:', msg.id);
                          }}
                        >
                          <i className="fas fa-thumbs-up"></i>
                        </button>
                        <button 
                          className="msg-action-btn msg-unlike-btn" 
                          title="Unlike response"
                          onClick={() => {
                            // Unlike functionality will be added later
                            console.log('Unlike clicked for bot message:', msg.id);
                          }}
                        >
                          <i className="fas fa-thumbs-down"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                      <div className="user-message-text">{msg.text || 'No content'}</div>
                  )}
                </div>
                );
              })}
              
              {isTyping && (
                <div className="typing-indicator show">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper" id="chat-input-wrapper">
            <textarea
              id="user-input"
              placeholder={
                apiStatus === "available" 
                  ? (isRecording ? "Speak now..." : "Ask Techno.ai for step-by-step solutions...") 
                  : "Configure API key to chat"
              }
              rows="1"
              aria-label="Message"
              value={isRecording && interimTranscript ? message + interimTranscript : message}
              onChange={(e) => {
                setMessage(e.target.value);
                autoResize(e);
              }}
              onKeyDown={handleKeyDown}
              onPaste={(e) => {
                setTimeout(() => {
                  autoResize(e);
                }, 0);
              }}
              onCut={(e) => {
                setTimeout(() => {
                  autoResize(e);
                }, 0);
              }}
              disabled={isTyping || apiStatus !== "available"}
            />

            {isRecording && interimTranscript && (
              <div className="interim-transcript">
                <i className="fas fa-waveform-lines"></i>
                {interimTranscript}
              </div>
            )}

            <div className="button-group">
              <button
                type="button"
                className={`icon-btn ${isRecording ? 'recording' : ''}`}
                id="mic-btn"
                aria-label="Voice input"
                onClick={toggleRecording}
                disabled={isTyping || apiStatus !== "available" || !isSpeechSupported}
                title={isSpeechSupported ? (isRecording ? "Stop recording" : "Start voice input") : "Voice input not supported"}
              >
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
              </button>

              <button
                type="button"
                className="icon-btn"
                id="send-btn"
                aria-label="Send message"
                onClick={handleSend}
                disabled={isTyping || !message.trim() || apiStatus !== "available"}
              >
                <i className="fas fa-arrow-up"></i>
              </button>
            </div>

            <div className="status" id="status"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;