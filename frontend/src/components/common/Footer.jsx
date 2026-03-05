import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <p className="footer-text">
                    Recommendations based on public data. Verify with banks before applying.
                </p>
                <p className="footer-copyright">
                    © {new Date().getFullYear()} CardAdvisor
                </p>
            </div>
        </footer>
    );
};

export default Footer;
