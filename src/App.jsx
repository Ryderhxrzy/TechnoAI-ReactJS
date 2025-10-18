// App.jsx
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx'; // Import Home instead of Profile
import LandingPage from './pages/LandingPage.jsx';

function App() {
    const [currentPage, setCurrentPage] = useState('landing');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const savedUserInfo = localStorage.getItem('userInfo');
                if (savedUserInfo) {
                    // Validate if the stored data is valid JSON
                    JSON.parse(savedUserInfo);
                    setCurrentPage('home'); // Changed from 'profile' to 'home'
                }
            } catch (error) {
                console.error('Error parsing stored user info:', error);
                // Clear invalid data
                localStorage.removeItem('userInfo');
                setCurrentPage('login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLoginSuccess = (userData) => {
        if (userData) {
            // Store the user data if provided
            localStorage.setItem('userInfo', JSON.stringify(userData));
        }
        setCurrentPage('home'); // Changed from 'profile' to 'home'
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        // Optional: Clear other stored data
        localStorage.removeItem('theme');
        setCurrentPage('login');
    };

    const handleNavigateToRegister = () => {
        setCurrentPage('register');
    };

    const handleNavigateToLogin = () => {
        setCurrentPage('login');
    };

    const handleNavigateToLanding = () => {
        setCurrentPage('landing');
    };

    const handleRegisterSuccess = (userData) => {
        if (userData) {
            localStorage.setItem('userInfo', JSON.stringify(userData));
        }
        setCurrentPage('home'); // Changed from 'profile' to 'home'
    };

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                </div>
                <p style={{ marginTop: '1rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <>
            {currentPage === 'landing' && (
                <LandingPage 
                    onNavigateToLogin={handleNavigateToLogin}
                    onNavigateToRegister={handleNavigateToRegister}
                />
            )}
            
            {currentPage === 'login' && (
                <Login 
                    onLoginSuccess={handleLoginSuccess}
                    onNavigateToRegister={handleNavigateToRegister}
                    onNavigateToLanding={handleNavigateToLanding}
                />
            )}
            
            {currentPage === 'register' && (
                <Register 
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigateToLogin={handleNavigateToLogin}
                    onNavigateToLanding={handleNavigateToLanding}
                />
            )}
            
            {currentPage === 'home' && ( // Changed from 'profile' to 'home'
                <Home onLogout={handleLogout} />
            )}
        </>
    );
}

export default App;