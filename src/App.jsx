import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx'; // Import Register component
import Profile from './pages/Profile.jsx';

function App() {
    const [currentPage, setCurrentPage] = useState('login');

    useEffect(() => {
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            setCurrentPage('profile');
        }
    }, []);

    const handleLoginSuccess = () => {
        setCurrentPage('profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo'); // Clear user info on logout
        setCurrentPage('login');
    };

    const handleNavigateToRegister = () => {
        setCurrentPage('register');
    };

    const handleNavigateToLogin = () => {
        setCurrentPage('login');
    };

    const handleRegisterSuccess = () => {
        setCurrentPage('profile');
    };

    return (
        <>
            {currentPage === 'login' && (
                <Login 
                    onLoginSuccess={handleLoginSuccess}
                    onNavigateToRegister={handleNavigateToRegister}
                />
            )}
            {currentPage === 'register' && (
                <Register 
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigateToLogin={handleNavigateToLogin}
                />
            )}
            {currentPage === 'profile' && (
                <Profile onLogout={handleLogout} />
            )}
        </>
    );
}

export default App;