import React from 'react';
import { formatCurrency, getApprovalBadge } from '../../utils/formatters';
import './RecommendationCard.css';

/**
 * RecommendationCard Component
 * 
 * Displays a single card recommendation with key metrics.
 */
const RecommendationCard = ({ recommendation, rank, isSelected, onClick }) => {
    const { card, netYearlyBenefit, approvalProbability, warnings } = recommendation;
    const approvalBadge = getApprovalBadge(approvalProbability);

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return { icon: '🥇', label: 'Best Match' };
            case 2: return { icon: '🥈', label: 'Runner Up' };
            case 3: return { icon: '🥉', label: 'Also Great' };
            default: return { icon: `#${rank}`, label: '' };
        }
    };

    const rankBadge = getRankBadge(rank);

    return (
        <div
            className={`recommendation-card ${isSelected ? 'selected' : ''} ${netYearlyBenefit < 0 ? 'negative' : ''}`}
            onClick={onClick}
        >
            {/* Rank Badge */}
            <div className="card-rank">
                <span className="rank-icon">{rankBadge.icon}</span>
                {rankBadge.label && <span className="rank-label">{rankBadge.label}</span>}
            </div>

            {/* Card Info */}
            <div className="card-main">
                <div className="card-header">
                    <div className="card-identity">
                        <h4 className="card-name">{card.name}</h4>
                        <span className="card-bank">{card.bank}</span>
                    </div>
                    <div className="card-fee">
                        {card.annualFee === 0 ? (
                            <span className="fee-free">FREE</span>
                        ) : (
                            <span className="fee-amount">₹{card.annualFee?.toLocaleString('en-IN')}/yr</span>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="card-tags">
                    <span className={`tag ${card.rewardType}`}>
                        {card.rewardType === 'cashback' ? '💵 Cashback' : '⭐ Points'}
                    </span>
                    {card.loungeAccess && (card.loungeAccess.domestic + card.loungeAccess.international) > 0 && (
                        <span className="tag lounge">
                            ✈️ {card.loungeAccess.domestic + card.loungeAccess.international} lounges
                        </span>
                    )}
                </div>
            </div>

            {/* Net Benefit */}
            <div className="card-benefit">
                <span className="benefit-label">Net Benefit/Year</span>
                <span className={`benefit-value ${netYearlyBenefit >= 0 ? 'positive' : 'negative'}`}>
                    {netYearlyBenefit >= 0 ? '+' : ''}{formatCurrency(netYearlyBenefit)}
                </span>
            </div>

            {/* Bottom Row */}
            <div className="card-footer">
                <span className={`approval-badge ${approvalBadge.className}`}>
                    {approvalBadge.icon} {approvalBadge.label}
                </span>
                {warnings?.length > 0 && (
                    <span className="warnings-indicator">
                        ⚠️ {warnings.length} warning{warnings.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="selected-indicator">
                    <span>Selected</span>
                </div>
            )}
        </div>
    );
};

export default RecommendationCard;
