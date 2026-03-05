import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import CompareCards from '../components/results/CompareCards';
import DownloadReport from '../components/results/DownloadReport';
import ShareButton from '../components/results/ShareButton';
import RewardBreakdownChart from '../components/results/RewardBreakdownChart';
import './ResultsPage.css';

const ResultsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState(0);
    const [compareMode, setCompareMode] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('recommendations');
        if (!stored) {
            navigate('/wizard');
            return;
        }
        setData(JSON.parse(stored));
    }, [navigate]);

    if (!data) {
        return (
            <div className="results loading">
                <div className="spinner" />
            </div>
        );
    }

    const { topRecommendations, summary } = data;
    const card = topRecommendations[selected];

    return (
        <div className="results">
            <div className={`results-container ${compareMode ? 'wide' : ''}`}>
                <div className="results-header">
                    <h1>Your Best Cards</h1>
                    <p className="text-muted">
                        Based on ₹{summary?.userTotalMonthlySpend?.toLocaleString('en-IN')}/month spending
                    </p>
                    {topRecommendations.length > 1 && (
                        <button
                            className={`btn btn-compare ${compareMode ? 'active' : ''}`}
                            onClick={() => setCompareMode(!compareMode)}
                        >
                            {compareMode ? '← Back to Details' : 'Compare Cards ⇌'}
                        </button>
                    )}
                </div>

                {compareMode ? (
                    <CompareCards cards={topRecommendations} />
                ) : (
                    <>
                        {/* Top 3 Cards */}
                        <div className="card-tabs">
                            {topRecommendations.map((rec, i) => (
                                <button
                                    key={i}
                                    className={`card-tab ${selected === i ? 'active' : ''}`}
                                    onClick={() => setSelected(i)}
                                >
                                    <span className="tab-rank">#{i + 1}</span>
                                    <span className="tab-name">{rec.card.name}</span>
                                    <span className={`tab-benefit ${rec.netYearlyBenefit >= 0 ? 'positive' : 'negative'}`}>
                                        {rec.netYearlyBenefit >= 0 ? '+' : ''}{formatCurrency(rec.netYearlyBenefit)}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Selected Card Details */}
                        {card && (
                            <div className="card-detail animate-in">
                                <div className="detail-header">
                                    <div>
                                        <h2>{card.card.name}</h2>
                                        <p className="text-muted">{card.card.bank}</p>
                                    </div>
                                    <div className={`big-benefit ${card.netYearlyBenefit >= 0 ? 'positive' : 'negative'}`}>
                                        <span className="benefit-label">Net Benefit/Year</span>
                                        <span className="benefit-amount">
                                            {card.netYearlyBenefit >= 0 ? '+' : ''}{formatCurrency(card.netYearlyBenefit)}
                                        </span>
                                    </div>
                                </div>

                                {/* Breakdown */}
                                <div className="breakdown">
                                    <h3>Reward Breakdown</h3>
                                    <div className="breakdown-grid">
                                        {[
                                            { key: 'foodRewards', label: 'Food & Dining' },
                                            { key: 'fuelRewards', label: 'Fuel' },
                                            { key: 'travelRewards', label: 'Travel' },
                                            { key: 'onlineRewards', label: 'Online' },
                                            { key: 'offlineRewards', label: 'Retail' },
                                            { key: 'loungeValue', label: 'Lounge Value' },
                                        ].filter(item => card.breakdown[item.key] > 0).map(item => (
                                            <div key={item.key} className="breakdown-row">
                                                <span>{item.label}</span>
                                                <span className="text-green">+{formatCurrency(card.breakdown[item.key])}</span>
                                            </div>
                                        ))}
                                        <div className="breakdown-row total">
                                            <span>Total Rewards</span>
                                            <span className="text-green">+{formatCurrency(card.breakdown.totalRewards + (card.breakdown.loungeValue || 0))}</span>
                                        </div>
                                        <div className="breakdown-row fee">
                                            <span>Annual Fee</span>
                                            <span className="text-red">-{formatCurrency(card.breakdown.annualFeeCost || card.card.annualFee)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Chart */}
                                <RewardBreakdownChart breakdown={card.breakdown} type="pie" />

                                {/* Why This Card */}
                                {card.reasons?.length > 0 && (
                                    <div className="reasons">
                                        <h3>Why This Card</h3>
                                        <ul>
                                            {card.reasons.map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Warnings */}
                                {card.warnings?.length > 0 && (
                                    <div className="warnings">
                                        <h3>Things to Consider</h3>
                                        {card.warnings.map((w, i) => (
                                            <div key={i} className={`warning ${w.severity}`}>
                                                {w.message}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Card Info */}
                                <div className="card-info">
                                    <div className="info-item">
                                        <span className="info-label">Annual Fee</span>
                                        <span className="info-value">
                                            {card.card.annualFee === 0 ? 'Free' : formatCurrency(card.card.annualFee)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Type</span>
                                        <span className="info-value">{card.card.rewardType}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Approval</span>
                                        <span className={`info-value approval-${card.approvalProbability}`}>
                                            {card.approvalProbability || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="results-actions">
                    <Link to="/wizard" className="btn btn-secondary">
                        ← Recalculate
                    </Link>
                    {!compareMode && card && (
                        <DownloadReport
                            recommendation={card}
                            summary={summary}
                            rank={selected + 1}
                        />
                    )}
                    {!compareMode && card && (
                        <ShareButton recommendation={card} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;

