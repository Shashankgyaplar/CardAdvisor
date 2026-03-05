import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import './NetBenefitBreakdown.css';

/**
 * NetBenefitBreakdown Component
 * 
 * Visual breakdown of reward calculation showing 
 * rewards earned vs fees paid.
 */
const NetBenefitBreakdown = ({ breakdown, card, netBenefit }) => {
    const rewardItems = [
        { key: 'foodRewards', label: 'Food & Dining', icon: '🍽️' },
        { key: 'fuelRewards', label: 'Fuel', icon: '⛽' },
        { key: 'travelRewards', label: 'Travel', icon: '✈️' },
        { key: 'onlineRewards', label: 'Online Shopping', icon: '🛒' },
        { key: 'offlineRewards', label: 'Retail', icon: '🏪' },
    ].filter(item => breakdown[item.key] > 0);

    const totalRewards = breakdown.totalRewards || 0;
    const loungeValue = breakdown.loungeValue || 0;
    const annualFee = breakdown.annualFeeCost || 0;

    return (
        <div className="net-benefit-breakdown">
            {/* Rewards Section */}
            <div className="breakdown-section rewards">
                <h4 className="section-header">
                    <span className="section-icon">💰</span>
                    Rewards You'll Earn
                </h4>

                <div className="breakdown-items">
                    {rewardItems.map((item) => (
                        <div key={item.key} className="breakdown-item">
                            <span className="item-label">
                                <span className="item-icon">{item.icon}</span>
                                {item.label}
                            </span>
                            <span className="item-value positive">
                                +{formatCurrency(breakdown[item.key])}
                            </span>
                        </div>
                    ))}

                    {loungeValue > 0 && (
                        <div className="breakdown-item lounge">
                            <span className="item-label">
                                <span className="item-icon">🛋️</span>
                                Lounge Access Value
                            </span>
                            <span className="item-value positive">
                                +{formatCurrency(loungeValue)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="section-total">
                    <span>Total Rewards</span>
                    <span className="total-value positive">
                        +{formatCurrency(totalRewards + loungeValue)}
                    </span>
                </div>
            </div>

            {/* Fees Section */}
            <div className="breakdown-section fees">
                <h4 className="section-header">
                    <span className="section-icon">💳</span>
                    Fees & Costs
                </h4>

                <div className="breakdown-items">
                    <div className="breakdown-item">
                        <span className="item-label">
                            <span className="item-icon">📅</span>
                            Annual Fee
                        </span>
                        <span className="item-value negative">
                            {annualFee > 0 ? `-${formatCurrency(annualFee)}` : '₹0 (Free)'}
                        </span>
                    </div>
                </div>

                <div className="section-total">
                    <span>Total Costs</span>
                    <span className="total-value negative">
                        -{formatCurrency(annualFee)}
                    </span>
                </div>
            </div>

            {/* Net Result */}
            <div className={`net-result ${netBenefit >= 0 ? 'positive' : 'negative'}`}>
                <div className="net-result-header">
                    <span className="net-icon">{netBenefit >= 0 ? '📈' : '📉'}</span>
                    <span className="net-label">Net Yearly Benefit</span>
                </div>
                <div className="net-value">
                    {netBenefit >= 0 ? '+' : ''}{formatCurrency(netBenefit)}
                </div>
                <p className="net-description">
                    {netBenefit >= 0
                        ? `You'll save ${formatCurrency(netBenefit)} annually with this card`
                        : `This card will cost you ${formatCurrency(Math.abs(netBenefit))} more than you'll earn`
                    }
                </p>
            </div>

            {/* Visual Bar */}
            <div className="benefit-bar">
                <div className="bar-track">
                    <div
                        className="bar-rewards"
                        style={{ width: `${Math.min(100, ((totalRewards + loungeValue) / (totalRewards + loungeValue + annualFee)) * 100)}%` }}
                    ></div>
                    <div
                        className="bar-fees"
                        style={{ width: `${Math.min(100, (annualFee / (totalRewards + loungeValue + annualFee)) * 100)}%` }}
                    ></div>
                </div>
                <div className="bar-legend">
                    <span className="legend-item rewards">
                        <span className="legend-dot"></span>
                        Rewards
                    </span>
                    <span className="legend-item fees">
                        <span className="legend-dot"></span>
                        Annual Fee
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NetBenefitBreakdown;
