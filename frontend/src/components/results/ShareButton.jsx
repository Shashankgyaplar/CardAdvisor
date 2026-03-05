import React, { useState } from 'react';
import './ShareButton.css';

const ShareButton = ({ recommendation }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const cardName = recommendation?.card?.name || 'a great credit card';
    const benefit = recommendation?.netYearlyBenefit || 0;
    const benefitText = benefit >= 0
        ? `save ₹${Math.abs(benefit).toLocaleString('en-IN')}/year`
        : `lose ₹${Math.abs(benefit).toLocaleString('en-IN')}/year`;

    const shareText = `I just discovered that ${cardName} can help me ${benefitText}! 💳✨\n\nFind your best credit card at CardAdvisor`;
    const shareUrl = window.location.origin;

    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        window.open(url, '_blank');
        setShowMenu(false);
    };

    const handleTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        setShowMenu(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        setShowMenu(false);
    };

    return (
        <div className="share-container">
            <button
                className="btn-share"
                onClick={() => setShowMenu(!showMenu)}
            >
                <span className="share-icon">📤</span>
                Share
            </button>

            {showMenu && (
                <div className="share-menu">
                    <button className="share-option whatsapp" onClick={handleWhatsApp}>
                        <span>💬</span> WhatsApp
                    </button>
                    <button className="share-option twitter" onClick={handleTwitter}>
                        <span>🐦</span> Twitter
                    </button>
                    <button className="share-option copy" onClick={handleCopy}>
                        <span>{copied ? '✓' : '📋'}</span> {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            )}

            {/* Click outside to close */}
            {showMenu && (
                <div
                    className="share-overlay"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
};

export default ShareButton;
