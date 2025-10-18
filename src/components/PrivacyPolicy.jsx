import React, { useState } from 'react';
import '../assets/styles/LoginRegister.css';
import '../assets/styles/sweetalert.css';
import '../assets/styles/styles.css';
import logo from '../assets/images/logo.png';
import Swal from 'sweetalert2';

const PrivacyPolicy = ({ onClose }) => {
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
            <div className="modal-content privacy-modal">
                <button className="theme-toggle" onClick={toggleTheme} aria-label='Toggle dark mode'>
                    <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} id='theme-icon'></i>
                </button>
                
                <div className="modal-header">
                    <h2>Privacy Policy</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="privacy-content">
                        <h3>1. Information We Collect</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:</p>
                        <ul>
                            <li>Name and email address</li>
                            <li>Profile information (if provided)</li>
                            <li>Authentication method (email or Google)</li>
                            <li>Chat messages and conversation history</li>
                            <li>Usage data and preferences</li>
                        </ul>

                        <h3>2. How We Use Your Information</h3>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices, updates, and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Monitor and analyze trends and usage</li>
                            <li>Personalize your experience</li>
                        </ul>

                        <h3>3. Information Sharing and Disclosure</h3>
                        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
                        <ul>
                            <li>With your explicit consent</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and prevent fraud</li>
                            <li>In connection with a business transfer or acquisition</li>
                        </ul>

                        <h3>4. Data Security</h3>
                        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication</li>
                            <li>Secure data storage practices</li>
                        </ul>

                        <h3>5. Data Retention</h3>
                        <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. We will delete or anonymize your information when:</p>
                        <ul>
                            <li>You request account deletion</li>
                            <li>The information is no longer necessary for our services</li>
                            <li>Required by applicable law</li>
                        </ul>

                        <h3>6. Your Rights and Choices</h3>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Delete your account and associated data</li>
                            <li>Opt-out of certain communications</li>
                            <li>Data portability</li>
                        </ul>

                        <h3>7. Cookies and Tracking Technologies</h3>
                        <p>We use cookies and similar tracking technologies to enhance your experience, including:</p>
                        <ul>
                            <li>Authentication and security cookies</li>
                            <li>Preference and settings cookies</li>
                            <li>Analytics and performance cookies</li>
                        </ul>

                        <h3>8. Third-Party Services</h3>
                        <p>Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.</p>

                        <h3>9. Children's Privacy</h3>
                        <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>

                        <h3>10. International Data Transfers</h3>
                        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.</p>

                        <h3>11. Changes to This Privacy Policy</h3>
                        <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.</p>

                        <h3>12. Contact Us</h3>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
                        <ul>
                            <li>Email: privacy@techno.ai</li>
                            <li>Support: support@techno.ai</li>
                        </ul>

                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
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

export default PrivacyPolicy;
