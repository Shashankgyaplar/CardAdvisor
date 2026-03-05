import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <p className="hero-label">Credit Card Advisor for India</p>
                    <h1 className="hero-title">
                        Find the credit card that
                        <br />
                        <span className="hero-accent">actually saves you money</span>
                    </h1>
                    <p className="hero-subtitle">
                        Most people lose ₹5,000–₹15,000 yearly on wrong cards.
                        <br />
                        We analyze your spending and find the best match.
                    </p>
                    <div className="hero-actions">
                        <Link to="/wizard" className="btn btn-primary btn-lg">
                            Get Recommendations
                        </Link>
                        <span className="hero-note">Free • 2 minutes • No signup</span>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="feature-grid">
                    <div className="feature">
                        <div className="feature-icon">₹</div>
                        <h3>Net Benefit Calculator</h3>
                        <p>See exactly how much you'll save or lose with each card after subtracting fees.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">⚡</div>
                        <h3>Smart Matching</h3>
                        <p>We match cards to your spending categories—food, travel, online, fuel.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">⚠</div>
                        <h3>Fee Detection</h3>
                        <p>Get warned when annual fees exceed rewards or benefits go unused.</p>
                    </div>
                </div>
            </section>

            <section className="banks">
                <p className="banks-label">Analyzing cards from</p>
                <div className="banks-list">
                    <span>HDFC</span>
                    <span>•</span>
                    <span>SBI</span>
                    <span>•</span>
                    <span>ICICI</span>
                    <span>•</span>
                    <span>Axis</span>
                    <span>•</span>
                    <span>Amex</span>
                    <span>•</span>
                    <span>Kotak</span>
                </div>
            </section>

            <section className="cta">
                <div className="cta-content">
                    <h2>Ready to find your best card?</h2>
                    <p>Answer a few questions about your spending.</p>
                    <Link to="/wizard" className="btn btn-primary btn-lg">
                        Start Now →
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
