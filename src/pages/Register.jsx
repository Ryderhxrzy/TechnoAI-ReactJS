import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function Register(props) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const countdownTimerRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
        };
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

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

    const redirectToLogin = () => {
        console.log('Redirecting to login...');
        localStorage.removeItem('userInfo');
        props.onNavigateToLogin();
    };

    const showSuccessAlert = () => {
        return new Promise((resolve) => {
            let timeLeft = 5;

            Swal.fire({
                title: '🎉 Account Created Successfully!',
                html: `Redirecting to login in <strong>${timeLeft}</strong> seconds...`,
                icon: 'success',
                showCancelButton: false,
                confirmButtonText: `Continue to Login (${timeLeft})`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                didOpen: () => {
                    const confirmButton = Swal.getConfirmButton();
                    const htmlContainer = Swal.getHtmlContainer();

                    countdownTimerRef.current = setInterval(() => {
                        timeLeft--;

                        if (htmlContainer) {
                            htmlContainer.innerHTML = `Redirecting to login in <strong>${timeLeft}</strong> seconds...`;
                        }

                        if (confirmButton) {
                            confirmButton.textContent = `Continue to Login (${timeLeft})`;
                        }

                        if (timeLeft <= 0) {
                            clearInterval(countdownTimerRef.current);
                            countdownTimerRef.current = null;
                            Swal.close();
                        }
                    }, 1000);
                },
                willClose: () => {
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = null;
                    }
                }
            }).then(() => {
                redirectToLogin();
                resolve();
            });
        });
    };

    const showErrorAlert = (title, text, icon = 'error') => {
        return Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'register-swal',
                title: 'register-swal-title',
                htmlContainer: 'register-swal-content',
                actions: 'register-swal-actions',
                confirmButton: 'register-swal-confirm'
            },
            buttonsStyling: false,
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            width: 'auto',
            padding: '1.5rem',
            borderRadius: '8px'
        });
    };

    const registerUserInDB = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);

        try {
            const token = credentialResponse.credential;
            const user = jwtDecode(token);

            console.log("Google Signup User:", user);

            const signupData = {
                full_name: user.name || `${user.given_name} ${user.family_name}`.trim(),
                email: user.email,
                profile: user.picture,
                method: 'google',
            };

            // Register user in MongoDB
            const result = await registerUserInDB(signupData);

            if (result.success) {
                console.log('Google registration successful:', result);
                
                // Show success message with countdown timer
                await showSuccessAlert();
            }
        } catch (error) {
            console.error("Google registration failed:", error);
            await showErrorAlert(
                '❌ Registration Failed', 
                error.message || 'Google registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("Google Signup Failed");
        showErrorAlert(
            '❌ Google Signup Failed', 
            'Google signup failed. Please try again.'
        );
    };

    const handleRegularSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            await showErrorAlert(
                '🔒 Password Mismatch', 
                'Passwords do not match. Please make sure both passwords are identical.',
                'warning'
            );
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            await showErrorAlert(
                '🔒 Password Too Short', 
                'Password must be at least 6 characters long for security.',
                'warning'
            );
            setIsLoading(false);
            return;
        }

        const userData = {
            full_name: formData.get('fullname'),
            email: formData.get('email'),
            password: password,
            method: 'email',
        };

        try {
            // Register user in MongoDB
            const result = await registerUserInDB(userData);

            if (result.success) {
                console.log('Email registration successful:', result);
                
                // Show success message with countdown timer
                await showSuccessAlert();
            }
        } catch (error) {
            console.error("Registration failed:", error);
            
            // Handle specific error cases
            let errorMessage = error.message || 'Registration failed. Please try again.';
            if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                errorMessage = 'An account with this email already exists. Please try logging in or use a different email.';
            }
            
            await showErrorAlert(
                '❌ Registration Failed', 
                errorMessage
            );
        } finally {
            setIsLoading(false);
        }
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
                    <button 
                        className="back-to-landing" 
                        onClick={props.onNavigateToLanding}
                        title="Back to Home"
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                </div>

                <form className="login-form" onSubmit={handleRegularSignup}>
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme={theme === "dark" ? "filled_black" : "outline"}
                            size="large"
                            text="signup_with"
                            disabled={isLoading}
                        />
                    </div>

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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                                placeholder='Create a password (min. 6 characters)' 
                                required 
                                disabled={isLoading}
                                minLength="6"
                            />
                            <button 
                                type="button" 
                                onClick={togglePassword} 
                                className="password-toggle" 
                                aria-label='Toggle password visibility'
                                disabled={isLoading}
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
                                disabled={isLoading}
                                minLength="6"
                            />
                            <button 
                                type="button" 
                                onClick={toggleConfirmPassword} 
                                className="password-toggle" 
                                aria-label='Toggle confirm password visibility'
                                disabled={isLoading}
                            >
                                <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="confirm-password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" name="terms" id="terms" required disabled={isLoading} />
                            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-user-plus"></i>
                                Create Account
                            </>
                        )}
                    </button>

                    <div className="register-link">
                        <span className='texts'>Already have an account? 
                            <button 
                                type="button" 
                                className="link-button"
                                onClick={props.onNavigateToLogin}
                                disabled={isLoading}
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