import React from 'react';
import { formatCurrency, getCategoryDisplayName } from '../../utils/formatters';
import './CardOptimization.css';

/**
 * CardOptimization Component
 * 
 * Displays analysis and optimization suggestions for existing cards.
 */
const CardOptimization = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    const {
        keepCards = [],
        closeCards = [],
        upgradeCards = [],
        categoryOptimization = {},
        overlappingBenefits = [],
        totalCurrentBenefit = 0,
        potentialSavings = 0,
    } = analysis;

    return (
        <div className="card-optimization">
            {/* Summary Stats */}
            <div className="optimization-summary">
                <div className="summary-stat">
                    <span className="stat-value positive">
                        {formatCurrency(totalCurrentBenefit)}
                    </span>
                    <span className="stat-label">Current Annual Benefit</span>
                </div>
                {potentialSavings > 0 && (
                    <div className="summary-stat">
                        <span className="stat-value highlight">
                            {formatCurrency(potentialSavings)}
                        </span>
                        <span className="stat-label">Potential Savings</span>
                    </div>
                )}
            </div>

            <div className="optimization-grid">
                {/* Cards to Keep */}
                {keepCards.length > 0 && (
                    <div className="optimization-section keep">
                        <h4>
                            <span className="section-icon">✅</span>
                            Cards to Keep ({keepCards.length})
                        </h4>
                        <div className="cards-list">
                            {keepCards.map((item, index) => (
                                <div key={index} className="card-item">
                                    <span className="card-name">{item.card?.name || 'Unknown Card'}</span>
                                    <p className="card-reason">{item.reason}</p>
                                    {item.netBenefit && (
                                        <span className="card-benefit positive">
                                            +{formatCurrency(item.netBenefit)}/yr
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cards to Close */}
                {closeCards.length > 0 && (
                    <div className="optimization-section close">
                        <h4>
                            <span className="section-icon">❌</span>
                            Consider Closing ({closeCards.length})
                        </h4>
                        <div className="cards-list">
                            {closeCards.map((item, index) => (
                                <div key={index} className="card-item">
                                    <span className="card-name">{item.card?.name || 'Unknown Card'}</span>
                                    <p className="card-reason">{item.reason}</p>
                                    {item.potentialSavings && (
                                        <span className="card-savings">
                                            Save {formatCurrency(item.potentialSavings)}/yr
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upgrade Suggestions */}
                {upgradeCards.length > 0 && (
                    <div className="optimization-section upgrade">
                        <h4>
                            <span className="section-icon">⬆️</span>
                            Upgrade Opportunities
                        </h4>
                        <div className="cards-list">
                            {upgradeCards.map((item, index) => (
                                <div key={index} className="upgrade-item">
                                    <div className="upgrade-flow">
                                        <span className="from-card">{item.fromCard?.name}</span>
                                        <span className="upgrade-arrow">→</span>
                                        <span className="to-card">{item.toCard?.name}</span>
                                    </div>
                                    <p className="upgrade-reason">{item.reason}</p>
                                    <span className="upgrade-benefit">
                                        +{formatCurrency(item.additionalBenefit)}/yr extra
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Optimization */}
            {Object.keys(categoryOptimization).length > 0 && (
                <div className="category-optimization">
                    <h4>
                        <span className="section-icon">🎯</span>
                        Best Card Per Category
                    </h4>
                    <div className="category-grid">
                        {Object.entries(categoryOptimization).map(([category, data]) => (
                            data && (
                                <div key={category} className="category-item">
                                    <span className="category-name">{getCategoryDisplayName(category)}</span>
                                    <span className="category-card">{data.cardName}</span>
                                    {data.yearlyReward && (
                                        <span className="category-reward">
                                            {formatCurrency(data.yearlyReward)}/yr
                                        </span>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Overlapping Benefits */}
            {overlappingBenefits.length > 0 && (
                <div className="overlapping-section">
                    <h4>
                        <span className="section-icon">🔄</span>
                        Overlapping Benefits Detected
                    </h4>
                    <ul className="overlap-list">
                        {overlappingBenefits.map((overlap, index) => (
                            <li key={index}>{overlap}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CardOptimization;
