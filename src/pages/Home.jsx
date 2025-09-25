import { useState, useEffect } from "react";
import "../assets/styles/styles.css";
import "../assets/styles/sweetalert.css";
import logo from "../assets/images/logo.png";

// Utility to get initials if no picture
function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function Home() {
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

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Watch theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Watch screen resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(false); // force uncollapsed for mobile
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Toggle sidebar (mobile vs desktop)
  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((prev) => !prev);
    } else {
      const newCollapsed = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsed);
      localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
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
  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    console.log("Message sent:", message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 144);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > 144 ? "auto" : "hidden";
  };

  const startNewChat = () => {
    setChatMessages([]);
    console.log("Starting new chat");
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
        <button className="new-chat-btn" onClick={startNewChat}>
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

        {/* User profile */}
        <div className="user-profile">
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
        <div id="chat-box">
          {chatMessages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>Welcome to Techno.ai, {firstName}!</h3>
              <p>
                I'm here to help you with coding, questions, and tasks. Ask me
                anything!
              </p>
            </div>
          ) : (
            <div className="messages-container">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}-message`}>
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        <div
          className="typing-indicator"
          id="typing-indicator"
          style={{ display: "none" }}
        >
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper" id="chat-input-wrapper">
            <textarea
              id="user-input"
              placeholder="Message Techno.ai"
              rows="1"
              aria-label="Message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                autoResize(e);
              }}
              onKeyDown={handleKeyDown}
            />

            <div className="button-group">
              <button
                type="button"
                className="icon-btn"
                id="mic-btn"
                aria-label="Voice input"
              >
                <i className="fas fa-microphone"></i>
              </button>

              <button
                type="button"
                className="icon-btn"
                id="send-btn"
                aria-label="Send message"
                onClick={handleSend}
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
