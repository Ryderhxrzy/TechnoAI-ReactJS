import React, { useState } from 'react';
import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import Swal from 'sweetalert2';

const TermsOfService = ({ onClose }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content terms-modal">
                <button className="theme-toggle" onClick={toggleTheme} aria-label='Toggle dark mode'>
                    <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} id='theme-icon'></i>
                </button>
                
                <div className="modal-header">
                    <h2>Terms of Service</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="terms-content">
                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing and using Techno.ai, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

                        <h3>2. Use License</h3>
                        <p>Permission is granted to temporarily use Techno.ai for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul>
                            <li>modify or copy the materials</li>
                            <li>use the materials for any commercial purpose or for any public display</li>
                            <li>attempt to reverse engineer any software contained on the website</li>
                            <li>remove any copyright or other proprietary notations from the materials</li>
                        </ul>

                        <h3>3. User Accounts</h3>
                        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>

                        <h3>4. Prohibited Uses</h3>
                        <p>You may not use our service:</p>
                        <ul>
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                            <li>To submit false or misleading information</li>
                        </ul>

                        <h3>5. Content</h3>
                        <p>Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service.</p>

                        <h3>6. Privacy Policy</h3>
                        <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.</p>

                        <h3>7. Termination</h3>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                        <h3>8. Disclaimer</h3>
                        <p>The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our service.</p>

                        <h3>9. Limitation of Liability</h3>
                        <p>In no event shall Techno.ai, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

                        <h3>10. Governing Law</h3>
                        <p>These Terms shall be interpreted and governed by the laws of the jurisdiction in which our company is located, without regard to its conflict of law provisions.</p>

                        <h3>11. Changes to Terms</h3>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>

                        <h3>12. Contact Information</h3>
                        <p>If you have any questions about these Terms of Service, please contact us at support@techno.ai</p>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
