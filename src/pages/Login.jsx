// Login.jsx
import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Home from './Home'; // Import Home instead of Profile
import Swal from 'sweetalert2';

function Login(props) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState('login');
    const [isLoading, setIsLoading] = useState(false);

    const passwordRef = useRef(null);
    const emailRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);

        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            setCurrentPage('home'); // Changed from 'profile' to 'home'
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
            passwordRef.current.type = passwordRef.current.type === "password" ? "text" : "password";
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            const token = credentialResponse.credential;
            const user = jwtDecode(token);

            console.log("Google User:", user);

            // Send Google user data to backend
            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: user.name,
                    email: user.email,
                    profile: user.picture,
                    method: 'google'
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                props.onLoginSuccess();
                setCurrentPage('home'); // Changed from 'profile' to 'home'
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Google login failed'
                });
            }
        } catch (error) {
            console.error("Google login error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong during Google login'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("Google Login Failed");
        Swal.fire({
            icon: 'error',
            title: 'Google Login Failed',
            text: 'Please try again'
        });
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please enter both email and password'
            });
            return;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                props.onLoginSuccess();
                setCurrentPage('home'); // Changed from 'profile' to 'home'
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Invalid credentials'
                });
            }
        } catch (error) {
            console.error("Email login error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong during login'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (currentPage === 'register') {
        return <Register />;
    }

    if (currentPage === 'home') { // Changed from 'profile' to 'home'
        return <Home />;
    }

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

                <form className="login-form" onSubmit={handleEmailLogin}>
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
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            ref={emailRef}
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
                                placeholder='Enter your password' 
                                required
                                minLength="6"
                            />
                            <button type="button" onClick={togglePassword} className="password-toggle" aria-label='Toggle password visibility'>
                                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label htmlFor="remember" className="remember-me">
                            <input type="checkbox" name="remember" id="remember" />
                            Remember Me
                        </label>
                        <a href="#" className='forgot-password'>Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" id="login-btn" disabled={isLoading}>
                        <i className="fas fa-sign-in-alt"></i>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="register-link">
                        <span className='texts'>Don't have an account? 
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={props.onNavigateToRegister}
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