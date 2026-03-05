import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardAPI } from '../services/api';
import './QuickLookupPage.css';

// Spending categories for quick lookup
const CATEGORIES = [
    { key: 'food', label: 'Food & Dining', icon: '🍔', description: 'Restaurants, Swiggy, Zomato' },
    { key: 'fuel', label: 'Fuel', icon: '⛽', description: 'Petrol pumps, fuel stations' },
    { key: 'travel', label: 'Travel', icon: '✈️', description: 'Flights, hotels, MakeMyTrip' },
    { key: 'online', label: 'Online Shopping', icon: '🛒', description: 'Amazon, Flipkart, Myntra' },
    { key: 'offline', label: 'Retail', icon: '🏪', description: 'Malls, supermarkets, stores' },
];

const QuickLookupPage = () => {
    const [cards, setCards] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cardAPI.getAll()
            .then(res => {
                if (res.data.success) {
                    setCards(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // Get best cards for selected category
    const getBestCards = () => {
        if (!selectedCategory || cards.length === 0) return [];

        return cards
            .map(card => ({
                card,
                rewardRate: card.rewards[selectedCategory] || card.rewards.default || 1,
                effectiveReward: (card.rewards[selectedCategory] || card.rewards.default || 1) *
                    (card.rewardType === 'points' ? card.pointValue : 1),
            }))
            .sort((a, b) => b.effectiveReward - a.effectiveReward)
            .slice(0, 5);
    };

    const bestCards = getBestCards();
    const selectedCategoryInfo = CATEGORIES.find(c => c.key === selectedCategory);

    return (
        <div className="quick-lookup">
            <div className="quick-lookup-container">
                <div className="quick-lookup-header">
                    <h1>Which Card Should I Use?</h1>
                    <p className="text-muted">
                        Select a spending category to find your best card
                    </p>
                </div>

                {/* Category Selection */}
                <div className="category-grid">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            className={`category-card ${selectedCategory === cat.key ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat.key)}
                        >
                            <span className="category-icon">{cat.icon}</span>
                            <span className="category-label">{cat.label}</span>
                            <span className="category-desc">{cat.description}</span>
                        </button>
                    ))}
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="loading">
                        <div className="spinner" />
                        <p>Loading cards...</p>
                    </div>
                ) : selectedCategory ? (
                    <div className="results-section animate-in">
                        <h2>
                            Best Cards for {selectedCategoryInfo?.icon} {selectedCategoryInfo?.label}
                        </h2>

                        <div className="best-cards-list">
                            {bestCards.map((item, index) => (
                                <div
                                    key={item.card._id}
                                    className={`best-card-item ${index === 0 ? 'top-pick' : ''}`}
                                >
                                    <div className="rank-badge">
                                        {index === 0 ? '👑' : `#${index + 1}`}
                                    </div>
                                    <div className="card-info">
                                        <h3>{item.card.name}</h3>
                                        <p className="card-bank">{item.card.bank}</p>
                                    </div>
                                    <div className="reward-info">
                                        <span className="reward-rate">
                                            {item.rewardRate}x
                                        </span>
                                        <span className="reward-type">
                                            {item.card.rewardType === 'cashback' ? 'Cashback' : 'Points'}
                                        </span>
                                        <span className="effective-value">
                                            ≈ {(item.effectiveReward).toFixed(1)}% value
                                        </span>
                                    </div>
                                    {item.card.annualFee > 0 && (
                                        <span className="annual-fee">
                                            ₹{item.card.annualFee.toLocaleString('en-IN')}/yr
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Tip */}
                        <div className="tip-box">
                            <span className="tip-icon">💡</span>
                            <p>
                                <strong>Pro Tip:</strong> Compare rewards with annual fees to find your true best value!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder">
                        <span className="placeholder-icon">👆</span>
                        <p>Select a category above to see your best cards</p>
                    </div>
                )}

                {/* Navigation */}
                <div className="quick-lookup-nav">
                    <Link to="/" className="btn btn-secondary">
                        ← Home
                    </Link>
                    <Link to="/wizard" className="btn btn-primary">
                        Full Analysis →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuickLookupPage;
