import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="logo">
                    <span className="logo-icon">◈</span>
                    <span className="logo-text">CardAdvisor</span>
                </Link>

                <nav className="nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/wizard"
                        className={`nav-link ${location.pathname === '/wizard' ? 'active' : ''}`}
                    >
                        Advisor
                    </Link>
                    <Link
                        to="/quick"
                        className={`nav-link ${location.pathname === '/quick' ? 'active' : ''}`}
                    >
                        Quick Pick
                    </Link>
                    <ThemeToggle />
                    <Link to="/wizard" className="btn btn-primary">
                        Get Started
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;

