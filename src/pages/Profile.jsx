import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import { useState, useEffect } from "react";

function Profile() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);

        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            setUserInfo(JSON.parse(savedUserInfo));
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
    };

    if (!userInfo) {
        return (
            <div className="loading-container">
                <div>Loading user information...</div>
                <button onClick={handleLogout} className="btn btn-secondary">
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <button className="theme-toggle" onClick={toggleTheme} aria-label='Toggle dark mode'>
                <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} id='theme-icon'></i>
            </button>

            <div className="profile-content">
                <div className="profile-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="TechnoAI Logo" className="logo-icon" />
                        </div>
                        <span className="logo-text">Techno.ai</span>
                    </div>
                    <h1>User Profile</h1>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
                
                <div className="profile-info">
                    <div className="info-card">
                        <h2>Personal Information</h2>
                        <div className="info-item">
                            <strong>Name:</strong> {userInfo.name}
                        </div>
                        <div className="info-item">
                            <strong>Email:</strong> {userInfo.email}
                        </div>
                        <div className="info-item">
                            <strong>Email Verified:</strong> {userInfo.email_verified ? 'Yes' : 'No'}
                        </div>
                        {userInfo.picture && (
                            <div className="info-item">
                                <strong>Profile Picture:</strong>
                                <img src={userInfo.picture} alt="Profile" className="profile-pic" />
                            </div>
                        )}
                    </div>

                    <div className="info-card">
                        <h2>JWT Token Details</h2>
                        <div className="info-item">
                            <strong>Issuer:</strong> {userInfo.iss}
                        </div>
                        <div className="info-item">
                            <strong>Audience:</strong> {userInfo.aud}
                        </div>
                        <div className="info-item">
                            <strong>Issued At:</strong> {new Date(userInfo.iat * 1000).toLocaleString()}
                        </div>
                        <div className="info-item">
                            <strong>Expires At:</strong> {new Date(userInfo.exp * 1000).toLocaleString()}
                        </div>
                    </div>

                    <div className="info-card">
                        <h2>Raw Data</h2>
                        <pre className="raw-data">
                            {JSON.stringify(userInfo, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;