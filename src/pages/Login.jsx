// Login.jsx
import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Profile from './Profile';

function Login(props) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState('login');

    const passwordRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);

        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            setCurrentPage('profile');
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
        if (passwordRef.current) {
        passwordRef.current.type =
            passwordRef.current.type === "password" ? "text" : "password";
        }
    };

    const handleGoogleSuccess = (credentialResponse) => {
        const token = credentialResponse.credential;
        const user = jwtDecode(token);

        console.log("Google User:", user);

        localStorage.setItem('userInfo', JSON.stringify(user));
        props.onLoginSuccess(); // This should navigate to profile
    };

    const handleGoogleError = () => {
        console.error("Google Login Failed");
    };

    if (currentPage === 'register') {
        return <Register />;
    }

    if (currentPage === 'profile') {
        return <Profile />;
    }

    // Show login form
    return (
        <>
            <button className="theme-toggle" onClick={toggleTheme} aria-label='Toggle dark mode'>
                <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} id='theme-icon'></i>
            </button>

            <div className="login-container">
                <div className="login-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="TechnoAI Logo" className="logo-icon" />
                        </div>
                        <span className="logo-text">Techno.ai</span>
                    </div>
                    <h1 className="login-title">Welcome back</h1>
                    <p className="login-subtitle">Sign in to your account to continue</p>
                </div>

                <form className="login-form" id="loginForm" method="post">
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme={theme === "dark" ? "filled_black" : "outline"}
                            size="large"
                        />
                    </div>
                    
                    <div className="divider"><span>or</span></div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input type="email" name="email" id="email" className="form-input" placeholder='Enter your email' />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-container">
                            <input type={showPassword ? "text" : "password"} ref={passwordRef} name="password" id="password" className="form-input" placeholder='Enter your password' />
                            <button type="button"  onClick={togglePassword}className="password-toggle" aria-label='Toggle pssword visibility'>
                                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label htmlFor="" className="remember-me">
                            <input type="checkbox" name="remember" id="remember" />
                            Remember Me
                        </label>
                        <a href="#" className='forgot-password'>Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" id="login-btn">
                        <i className="fas fa-sign-in-alt"></i>
                        Sign in
                    </button>

                    <div className="register-link">
                        <span className='texts'>Don't have an account? 
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={props.onNavigateToRegister} // Use the prop from App
                            >
                                Create account
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Login;