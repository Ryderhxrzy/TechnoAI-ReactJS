import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Register(props) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Copying the same toggle logic from Login.jsx
    const togglePassword = () => {
        setShowPassword((prev) => !prev);
        if (passwordRef.current) {
            passwordRef.current.type = passwordRef.current.type === "password" ? "text" : "password";
        }
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
        if (confirmPasswordRef.current) {
            confirmPasswordRef.current.type = confirmPasswordRef.current.type === "password" ? "text" : "password";
        }
    };

    const handleGoogleSuccess = (credentialResponse) => {
        const token = credentialResponse.credential;
        const user = jwtDecode(token);

        console.log("Google Signup User:", user);

        const signupData = {
            ...user,
            signup_method: 'google',
            signup_date: new Date().toISOString()
        };

        localStorage.setItem('userInfo', JSON.stringify(signupData));
        props.onRegisterSuccess();
    };

    const handleGoogleError = () => {
        console.error("Google Signup Failed");
    };

    const handleRegularSignup = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            fullname: formData.get('fullname'),
            email: formData.get('email'),
            password: formData.get('password'),
            signup_method: 'email',
            signup_date: new Date().toISOString()
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userData));
        props.onRegisterSuccess();
    };

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
                    <h1 className="login-title">Create your account</h1>
                    <p className="login-subtitle">Sign up to get started with Techno.ai</p>
                </div>

                <form className="login-form" onSubmit={handleRegularSignup}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme={theme === "dark" ? "filled_black" : "outline"}
                        size="large"
                        text="signup_with"
                    />

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullname" className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            name="fullname" 
                            id="fullname" 
                            className="form-input" 
                            placeholder='Enter your full name' 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            className="form-input" 
                            placeholder='Enter your email' 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-container">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                ref={passwordRef} 
                                name="password" 
                                id="password" 
                                className="form-input" 
                                placeholder='Create a password' 
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={togglePassword} 
                                className="password-toggle" 
                                aria-label='Toggle password visibility'
                            >
                                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="password-container">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                ref={confirmPasswordRef} 
                                name="confirmPassword" 
                                id="confirmPassword" 
                                className="form-input" 
                                placeholder='Confirm your password' 
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={toggleConfirmPassword} 
                                className="password-toggle" 
                                aria-label='Toggle confirm password visibility'
                            >
                                <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="confirm-password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" name="terms" id="terms" required />
                            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-user-plus"></i>
                        Create Account
                    </button>

                    <div className="register-link">
                        <span className='texts'>Already have an account? 
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={props.onNavigateToLogin}
                            >
                                Sign in
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Register;