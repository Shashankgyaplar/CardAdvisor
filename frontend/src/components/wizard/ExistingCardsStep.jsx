import React from 'react';
import './ExistingCardsStep.css';

/**
 * ExistingCardsStep Component
 * 
 * Fourth step (optional) - select existing credit cards for optimization.
 */
const ExistingCardsStep = ({ selectedCards, availableCards, updateFormData }) => {
    const toggleCard = (cardId) => {
        const newSelection = selectedCards.includes(cardId)
            ? selectedCards.filter(id => id !== cardId)
            : [...selectedCards, cardId];

        updateFormData('existingCardIds', newSelection);
    };

    // Group cards by bank
    const cardsByBank = availableCards.reduce((groups, card) => {
        const bank = card.bank;
        if (!groups[bank]) {
            groups[bank] = [];
        }
        groups[bank].push(card);
        return groups;
    }, {});

    return (
        <div className="existing-cards-step">
            <div className="optional-badge">
                <span className="badge badge-info">Optional</span>
            </div>

            <p className="step-description">
                Already have credit cards? Select them to get optimization suggestions
                – which to keep, close, or upgrade.
            </p>

            {selectedCards.length > 0 && (
                <div className="selected-count">
                    <span className="badge badge-success">
                        {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''} selected
                    </span>
                </div>
            )}

            {Object.keys(cardsByBank).length > 0 ? (
                <div className="banks-list">
                    {Object.entries(cardsByBank).map(([bank, cards]) => (
                        <div key={bank} className="bank-group">
                            <h4 className="bank-name">{bank}</h4>
                            <div className="cards-grid">
                                {cards.map((card) => (
                                    <div
                                        key={card._id}
                                        className={`card-item ${selectedCards.includes(card._id) ? 'selected' : ''}`}
                                        onClick={() => toggleCard(card._id)}
                                    >
                                        <div className="card-info">
                                            <span className="card-name">{card.name}</span>
                                            <span className="card-fee">
                                                {card.annualFee === 0
                                                    ? 'No annual fee'
                                                    : `₹${card.annualFee.toLocaleString('en-IN')}/year`
                                                }
                                            </span>
                                        </div>
                                        <div className="card-checkbox">
                                            {selectedCards.includes(card._id) ? (
                                                <span className="checkbox checked">✓</span>
                                            ) : (
                                                <span className="checkbox"></span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="loading-cards">
                    <div className="spinner"></div>
                    <p>Loading available cards...</p>
                </div>
            )}

            {/* Benefit notice */}
            <div className="benefit-notice">
                <span className="benefit-icon">💡</span>
                <div>
                    <strong>Why select existing cards?</strong>
                    <p>
                        We'll analyze your current cards and show you which one is best
                        for each spending category, find overlapping benefits, and suggest
                        cards to close or upgrade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExistingCardsStep;
