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

function generateResponseTitle(userQuestion) {
  if (userQuestion.length > 50) {
    userQuestion = userQuestion.substring(0, 50) + '...';
  }
  
  const patterns = {
    code: /(gumawa ng code|paano gawin ang|how to code|write a code|create a|function|class)/i,
    explain: /(ano ang|what is|explain|ipaliwanag|meaning of|define)/i,
    compare: /(difference between|vs\.?|compare|pagkakaiba)/i,
    tutorial: /(paano|how to|steps|tutorial|guide|gabay)/i,
    error: /(error|fix|problem|issue|not working|ayaw gumana)/i
  };
  
  if (patterns.code.test(userQuestion)) {
    return "Step-by-Step Code Solution";
  } else if (patterns.explain.test(userQuestion)) {
    return "Step-by-Step Explanation";
  } else if (patterns.compare.test(userQuestion)) {
    return "Step-by-Step Comparison";
  } else if (patterns.tutorial.test(userQuestion)) {
    return "Step-by-Step Guide";
  } else if (patterns.error.test(userQuestion)) {
    return "Step-by-Step Solution";
  }
  
  return "Step-by-Step Response";
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
  const responseTitle = typeof generateResponseTitle === 'function'
    ? generateResponseTitle(userQuestion)
    : (userQuestion || 'Response');

  // wrapper start
  let formattedText = `
    <div class="response-container">
      <div class="response-header">
        <div class="response-title-container">
          <h4 class="response-title">${escapeHtml(responseTitle)}</h4>
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

// Function to enhance user prompt for step-by-step responses
function enhancePromptForSteps(userMessage, userName) {
  // Check if it's a greeting
  if (isGreeting(userMessage)) {
    return `Respond to this greeting: "${userMessage}". Always start your response by introducing yourself as "Hi! I'm Techno.ai" and include the user's name "${userName}" in a friendly way. Keep it conversational and ask how you can help them today.`;
  }

  // For technical questions, modify the prompt to request step-by-step solutions
  const stepByStepInstruction = `
Please provide a comprehensive step-by-step solution for: "${userMessage}"

Structure your response as follows:
1. Start with a brief overview of what we're going to solve
2. Break down the solution into clear, numbered steps
3. Explain each step thoroughly with reasoning
4. Provide the final answer or complete solution at the end
5. If it involves code, show the step-by-step development process first, then provide the complete final code

Make sure to explain the "why" behind each step, not just the "how". This helps the user understand the problem-solving process.
`;

  return stepByStepInstruction;
}

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

  // Check API key on component mount
  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = () => {
    const apiKey = import.meta.env.VITE_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      setApiStatus("unavailable");
      Swal.fire({
        title: 'API Key Missing',
        text: 'Gemini API key is not configured in .env file',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!apiKey.startsWith('AIza')) {
      setApiStatus("unavailable");
      Swal.fire({
        title: 'Invalid API Key Format',
        text: 'API key should start with "AIza"',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }

    setApiStatus("available");
    return true;
  };

  // Send message to Gemini API
  const sendToGemini = async (userMessage) => {
    const apiKey = import.meta.env.VITE_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // Enhance the prompt for step-by-step responses
    const enhancedMessage = enhancePromptForSteps(userMessage, firstName);

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
        maxOutputTokens: 2000, // Increased for more detailed step-by-step responses
        temperature: 0.7,
      }
    };

    try {
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
        console.error('API Error Response:', errorData);
        
        if (response.status === 404) {
          return tryAlternativeModels(enhancedMessage, apiKey);
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorData.error?.message || 'Invalid request format'}`);
        } else if (response.status === 403) {
          throw new Error(`API key invalid or permission denied`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please try again later.`);
        } else {
          throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'API request failed'}`);
        }
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected API response format");
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
            maxOutputTokens: 2000,
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

  const startNewChat = () => {
    setChatMessages([]);
    setIsTyping(false);
  };

  // Function to handle copy button clicks safely
  const handleCopyClick = (text) => {
    copyToClipboard(text);
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
          <div className="chat-item active" data-chat-id="1">
            <div className="chat-title">Welcome Chat</div>
            <div className="chat-preview">How can I help you today?</div>
            <div className="chat-time">Just now</div>
          </div>
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
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender}-message ${msg.isError ? 'error-message' : ''}`}
                >
                  {msg.sender === "bot" && msg.formattedText ? (
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
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
              
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
              placeholder={apiStatus === "available" ? "Ask Techno.ai for step-by-step solutions..." : "Configure API key to chat"}
              rows="1"
              aria-label="Message"
              value={message}
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

            <div className="button-group">
              <button
                type="button"
                className="icon-btn"
                id="mic-btn"
                aria-label="Voice input"
                disabled={isTyping || apiStatus !== "available"}
              >
                <i className="fas fa-microphone"></i>
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