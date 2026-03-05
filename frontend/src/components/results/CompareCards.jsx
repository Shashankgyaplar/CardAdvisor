import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import './CompareCards.css';

const CompareCards = ({ cards }) => {
    if (!cards || cards.length === 0) return null;

    // Categories to compare
    const rewardCategories = [
        { key: 'foodRewards', label: 'Food & Dining', icon: '🍽️' },
        { key: 'fuelRewards', label: 'Fuel', icon: '⛽' },
        { key: 'travelRewards', label: 'Travel', icon: '✈️' },
        { key: 'onlineRewards', label: 'Online Shopping', icon: '🛒' },
        { key: 'offlineRewards', label: 'Retail', icon: '🏪' },
        { key: 'loungeValue', label: 'Lounge Access', icon: '🛋️' },
    ];

    // Find best value for highlighting
    const getBestIndex = (key) => {
        let bestIdx = 0;
        let bestVal = cards[0]?.breakdown?.[key] || 0;
        cards.forEach((card, i) => {
            const val = card.breakdown?.[key] || 0;
            if (val > bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        });
        return bestVal > 0 ? bestIdx : -1;
    };

    const getLowestFeeIndex = () => {
        let bestIdx = 0;
        let bestVal = cards[0]?.card?.annualFee ?? Infinity;
        cards.forEach((card, i) => {
            const val = card.card?.annualFee ?? Infinity;
            if (val < bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        });
        return bestIdx;
    };

    const getBestBenefitIndex = () => {
        let bestIdx = 0;
        let bestVal = cards[0]?.netYearlyBenefit ?? -Infinity;
        cards.forEach((card, i) => {
            const val = card.netYearlyBenefit ?? -Infinity;
            if (val > bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        });
        return bestIdx;
    };

    const bestBenefitIdx = getBestBenefitIndex();
    const lowestFeeIdx = getLowestFeeIndex();

    return (
        <div className="compare-cards animate-in">
            {/* Header Row */}
            <div className="compare-header">
                <div className="compare-label">Card</div>
                {cards.map((card, i) => (
                    <div key={i} className="compare-card-header">
                        <span className="compare-rank">#{i + 1}</span>
                        <span className="compare-name">{card.card.name}</span>
                        <span className="compare-bank">{card.card.bank}</span>
                    </div>
                ))}
            </div>

            {/* Net Benefit Row */}
            <div className="compare-row highlight-row">
                <div className="compare-label">Net Benefit/Year</div>
                {cards.map((card, i) => (
                    <div 
                        key={i} 
                        className={`compare-value ${i === bestBenefitIdx ? 'best' : ''} ${card.netYearlyBenefit >= 0 ? 'positive' : 'negative'}`}
                    >
                        {card.netYearlyBenefit >= 0 ? '+' : ''}{formatCurrency(card.netYearlyBenefit)}
                        {i === bestBenefitIdx && <span className="best-badge">Best</span>}
                    </div>
                ))}
            </div>

            {/* Annual Fee Row */}
            <div className="compare-row">
                <div className="compare-label">Annual Fee</div>
                {cards.map((card, i) => (
                    <div 
                        key={i} 
                        className={`compare-value ${i === lowestFeeIdx ? 'best' : ''}`}
                    >
                        {card.card.annualFee === 0 ? 'Free' : formatCurrency(card.card.annualFee)}
                        {i === lowestFeeIdx && cards.length > 1 && <span className="best-badge">Lowest</span>}
                    </div>
                ))}
            </div>

            {/* Reward Categories */}
            <div className="compare-section-title">Rewards Breakdown</div>
            {rewardCategories.map(cat => {
                const bestIdx = getBestIndex(cat.key);
                const hasAnyValue = cards.some(c => (c.breakdown?.[cat.key] || 0) > 0);
                if (!hasAnyValue) return null;
                
                return (
                    <div key={cat.key} className="compare-row">
                        <div className="compare-label">
                            <span className="cat-icon">{cat.icon}</span> {cat.label}
                        </div>
                        {cards.map((card, i) => {
                            const val = card.breakdown?.[cat.key] || 0;
                            return (
                                <div 
                                    key={i} 
                                    className={`compare-value ${i === bestIdx ? 'best' : ''}`}
                                >
                                    {val > 0 ? `+${formatCurrency(val)}` : '—'}
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {/* Pros Section */}
            <div className="compare-section-title">✓ Pros</div>
            <div className="compare-row pros-row">
                <div className="compare-label"></div>
                {cards.map((card, i) => (
                    <div key={i} className="compare-list">
                        {card.reasons?.length > 0 ? (
                            <ul>
                                {card.reasons.map((r, j) => (
                                    <li key={j} className="pro-item">{r}</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="no-items">—</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Cons Section */}
            <div className="compare-section-title">⚠ Cons</div>
            <div className="compare-row cons-row">
                <div className="compare-label"></div>
                {cards.map((card, i) => (
                    <div key={i} className="compare-list">
                        {card.warnings?.length > 0 ? (
                            <ul>
                                {card.warnings.map((w, j) => (
                                    <li key={j} className={`con-item ${w.severity}`}>
                                        {w.message}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="no-items text-green">No concerns</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Card Info */}
            <div className="compare-section-title">Card Details</div>
            <div className="compare-row">
                <div className="compare-label">Reward Type</div>
                {cards.map((card, i) => (
                    <div key={i} className="compare-value capitalize">{card.card.rewardType}</div>
                ))}
            </div>
            <div className="compare-row">
                <div className="compare-label">Approval Chance</div>
                {cards.map((card, i) => (
                    <div key={i} className={`compare-value approval-${card.approvalProbability}`}>
                        {card.approvalProbability || 'Unknown'}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompareCards;
