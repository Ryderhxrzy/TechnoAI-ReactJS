import { useState, useEffect } from 'react';
import '../assets/styles/styles.css';
import '../assets/styles/LandingPage.css';
import logo from '../assets/images/logo.png';

function LandingPage({ onNavigateToLogin, onNavigateToRegister }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.classList.add('landing-page');
        
        return () => {
            document.body.classList.remove('landing-page');
        };
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const closeNav = () => setNavOpen(false);
    const toggleNav = () => setNavOpen((prev) => !prev);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label='Toggle dark mode'>
                <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} id='theme-icon'></i>
            </button>

            {/* Navigation */}
            <nav className="landing-nav" role="navigation" aria-label="Main">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src={logo} alt="TechnoAI Logo" className="nav-logo-img" />
                        <span className="nav-logo-text">Techno.ai</span>
                    </div>
                    {/* Mobile nav toggle */}
                    <button
                        className="nav-toggle"
                        aria-controls="primary-navigation"
                        aria-expanded={navOpen}
                        onClick={toggleNav}
                    >
                        <i className={navOpen ? "fas fa-times" : "fas fa-bars"}></i>
                        <span className="sr-only">Menu</span>
                    </button>

                    <div id="primary-navigation" className={`nav-menu ${navOpen ? 'open' : ''}`}>
                        <button className="nav-link" onClick={() => { closeNav(); scrollToSection('features'); }}>
                            Features
                        </button>
                        <button className="nav-link" onClick={() => { closeNav(); scrollToSection('about'); }}>
                            About
                        </button>
                        <button className="nav-link" onClick={() => { closeNav(); scrollToSection('contact'); }}>
                            Contact
                        </button>
                        <button className="nav-btn nav-btn-outline" onClick={() => { closeNav(); onNavigateToLogin(); }}>
                            Sign In
                        </button>
                        <button className="nav-btn nav-btn-primary" onClick={() => { closeNav(); onNavigateToRegister(); }}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            AI-Powered Learning for 
                            <span className="hero-highlight"> BSIT Students</span>
                        </h1>
                        <p className="hero-subtitle">
                            Get personalized step-by-step guidance, coding assistance, and comprehensive 
                            explanations tailored specifically for Bachelor of Science in Information Technology students at BCP.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn btn-primary btn-large" onClick={onNavigateToRegister}>
                                <i className="fas fa-rocket"></i>
                                Start Learning Now
                            </button>
                            <button className="btn btn-outline btn-large" onClick={() => scrollToSection('features')}>
                                <i className="fas fa-play"></i>
                                Learn More
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Students Helped</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">1000+</div>
                                <div className="stat-label">Problems Solved</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">AI Support</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-illustration">
                            <img 
                                src={logo} 
                                alt="TechnoAI Logo" 
                                className="hero-logo-image"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Techno.ai?</h2>
                        <p className="section-subtitle">
                            Designed specifically for BSIT students with features that enhance your learning experience
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                            <h3 className="feature-title">Step-by-Step Learning</h3>
                            <p className="feature-description">
                                Get detailed, educational explanations broken down into manageable steps, 
                                perfect for understanding complex IT concepts.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-code"></i>
                            </div>
                            <h3 className="feature-title">Code Assistance</h3>
                            <p className="feature-description">
                                Receive help with programming in multiple languages including Java, Python, 
                                JavaScript, HTML/CSS, and more.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-microphone"></i>
                            </div>
                            <h3 className="feature-title">Voice Input</h3>
                            <p className="feature-description">
                                Ask questions naturally using voice input for a more intuitive and 
                                hands-free learning experience.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-lightbulb"></i>
                            </div>
                            <h3 className="feature-title">Smart Explanations</h3>
                            <p className="feature-description">
                                Get explanations tailored to your skill level with practical examples 
                                and real-world applications.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3 className="feature-title">24/7 Availability</h3>
                            <p className="feature-description">
                                Access help whenever you need it, whether you're studying late at night 
                                or working on assignments.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3 className="feature-title">BCP Community</h3>
                            <p className="feature-description">
                                Join a community of fellow BSIT students at Bestlink College of the Philippines, 
                                sharing knowledge and experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <div className="about-content">
                        <div className="about-text">
                            <h2 className="section-title">Built for BSIT Students</h2>
                            <p className="about-description">
                                Techno.ai is specifically designed to support Bachelor of Science in Information Technology 
                                students at Bestlink College of the Philippines. Our AI-powered platform understands the 
                                unique challenges and curriculum requirements of BSIT students.
                            </p>
                            <div className="about-features">
                                <div className="about-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Curriculum-aligned assistance</span>
                                </div>
                                <div className="about-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Industry-relevant examples</span>
                                </div>
                                <div className="about-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Practical project guidance</span>
                                </div>
                                <div className="about-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Exam preparation support</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-image">
                            <div className="about-illustration">
                                <div className="student-avatar">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <div className="learning-elements">
                                    <div className="element element-1">
                                        <i className="fas fa-laptop-code"></i>
                                    </div>
                                    <div className="element element-2">
                                        <i className="fas fa-book"></i>
                                    </div>
                                    <div className="element element-3">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Accelerate Your Learning?</h2>
                        <p className="cta-subtitle">
                            Join hundreds of BSIT students who are already using Techno.ai to excel in their studies
                        </p>
                        <div className="cta-buttons">
                            <button className="btn btn-primary btn-large" onClick={onNavigateToRegister}>
                                <i className="fas fa-user-plus"></i>
                                Create Free Account
                            </button>
                            <button className="btn btn-outline btn-large" onClick={onNavigateToLogin}>
                                <i className="fas fa-sign-in-alt"></i>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src={logo} alt="TechnoAI Logo" className="footer-logo-img" />
                                <span className="footer-logo-text">Techno.ai</span>
                            </div>
                            <p className="footer-description">
                                Empowering BSIT students at BCP with AI-powered learning tools and personalized assistance.
                            </p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4 className="footer-title">Product</h4>
                                <a href="#" className="footer-link">Features</a>
                                <a href="#" className="footer-link">Pricing</a>
                                <a href="#" className="footer-link">Updates</a>
                            </div>
                            <div className="footer-column">
                                <h4 className="footer-title">Support</h4>
                                <a href="#" className="footer-link">Help Center</a>
                                <a href="#" className="footer-link">Contact Us</a>
                                <a href="#" className="footer-link">Community</a>
                            </div>
                            <div className="footer-column">
                                <h4 className="footer-title">BCP</h4>
                                <a href="#" className="footer-link">About BCP</a>
                                <a href="#" className="footer-link">BSIT Program</a>
                                <a href="#" className="footer-link">Student Resources</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="footer-legal">
                            <a 
                                href="/privacy-policy.html" 
                                className="footer-legal-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Privacy Policy
                            </a>
                            <span className="footer-separator">|</span>
                            <a 
                                href="/terms-of-service.html" 
                                className="footer-legal-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Terms of Service
                            </a>
                        </div>
                        <p className="footer-copyright">
                            © 2025 Techno.ai. Built for BSIT students at Bestlink College of the Philippines.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default LandingPage;
