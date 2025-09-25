import '../assets/styles/styles.css';
import '../assets/styles/sweetalert.css';
import logo from '../assets/images/logo.png';
import userImage from '../assets/images/profile.png'; // static image (default user avatar)

// Utility to get initials if no picture
function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function Header() {
    // Get user data from localStorage
    let user = {
        name: "John Doe",
        email: "john@example.com",
        picture: "" // default fallback
    };

    try {
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            const parsedUser = JSON.parse(savedUserInfo);
            user = {
                name: parsedUser.full_name || parsedUser.name || "John Doe",
                email: parsedUser.email || "john@example.com",
                picture: parsedUser.profile || parsedUser.picture || ""
            };
        }
    } catch (error) {
        console.error('Error parsing user info:', error);
        // Keep default user data
    }

    const fullName = user.name || user.email;
    const initials = getInitials(fullName);

    return (
        <div className="app-container">
            <div className="sidebar" id="sidebar">
                {/* Sidebar minimizer */}
                <button className="sidebar-minimizer">
                    <i className="fas fa-chevron-right"></i>
                </button>

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <img src={logo} alt="Techno AI Logo" className="logo-icon" />
                    </div>
                    <span className="logo-text">Techno.ai</span>
                </div>

                {/* New chat button */}
                <button className="new-chat-btn">
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
                            <img
                                src={user.picture}
                                alt={fullName}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                            />
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

            {/* Chat Header */}
            <div className="chat-container">
                <div className="chat-header">
                    <div className="header-info">
                        <h2>
                            <div className="header-minimizer" id="header-minimizer">
                                <i className="fas fa-chevron-left"></i>
                            </div>
                            Minimize
                        </h2>
                    </div>
                    <div className="header-actions">
                        <button
                            className="action-btn"
                            id="theme-toggle-btn"
                            title="Toggle dark/light mode"
                        >
                            <i className="fas fa-moon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;