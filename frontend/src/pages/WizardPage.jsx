import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationAPI, cardAPI } from '../services/api';
import {
    SPENDING_CATEGORIES,
    getInitialSpending,
    aggregateSpending,
    getGroupTotal
} from '../utils/spendingCategories';
import './WizardPage.css';

const WizardPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cards, setCards] = useState([]);

    // UI State for accordion
    const [expandedGroup, setExpandedGroup] = useState(0);

    const [data, setData] = useState({
        spending: getInitialSpending(),
        travelFrequency: 'occasional',
        loungeUsage: 'sometimes',
        rewardPreference: 'cashback',
        annualFeeTolerance: 'low',
        monthlyIncome: '',
        creditScore: null,
        existingCardIds: [],
    });

    useEffect(() => {
        cardAPI.getAll().then(res => {
            if (res.data.success) setCards(res.data.data);
        }).catch(console.error);
    }, []);

    const updateSpending = (key, val) => {
        setData(d => ({ ...d, spending: { ...d.spending, [key]: val.replace(/\D/g, '') } }));
    };

    const totalSpend = Object.values(data.spending).reduce((s, v) => s + (parseInt(v) || 0), 0);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const aggregatedSpending = aggregateSpending(data.spending);

            const response = await recommendationAPI.generate({
                spending: aggregatedSpending,
                travelFrequency: data.travelFrequency,
                loungeUsage: data.loungeUsage,
                rewardPreference: data.rewardPreference,
                annualFeeTolerance: data.annualFeeTolerance,
                monthlyIncome: parseInt(data.monthlyIncome) || null,
                creditScore: data.creditScore,
                existingCardIds: data.existingCardIds,
            });

            if (response.data.success) {
                sessionStorage.setItem('recommendations', JSON.stringify(response.data.data));
                navigate('/results');
            } else {
                throw new Error(response.data.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCard = (id) => {
        setData(d => ({
            ...d,
            existingCardIds: d.existingCardIds.includes(id)
                ? d.existingCardIds.filter(x => x !== id)
                : [...d.existingCardIds, id]
        }));
    };

    return (
        <div className="wizard">
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1>Find Your Best Card</h1>
                    <p className="text-muted">Step {step} of 4</p>
                </div>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
                </div>

                <div className="wizard-content animate-in" key={step}>
                    {step === 1 && (
                        <div className="step">
                            <h2>Monthly Spending</h2>
                            <p className="step-desc">Enter your approximate monthly spend by category</p>

                            <div className="spending-groups">
                                {SPENDING_CATEGORIES.map((group, index) => {
                                    const isExpanded = expandedGroup === index;
                                    const groupTotal = getGroupTotal(data.spending, group.items);

                                    return (
                                        <div key={group.parent} className={`spending-group ${isExpanded ? 'expanded' : ''}`}>
                                            <div
                                                className="group-header"
                                                onClick={() => setExpandedGroup(isExpanded ? -1 : index)}
                                            >
                                                <div className="group-header-left">
                                                    <span className="group-icon">{group.icon}</span>
                                                    <span className="group-title">{group.group}</span>
                                                </div>
                                                <div className="group-header-right">
                                                    {groupTotal > 0 && (
                                                        <span className="group-total">₹{groupTotal.toLocaleString('en-IN')}</span>
                                                    )}
                                                    <span className="group-chevron">{isExpanded ? '−' : '+'}</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="group-inputs animate-in">
                                                    {group.items.map(item => (
                                                        <div key={item.key} className="input-field compact">
                                                            <label>{item.label}</label>
                                                            <div className="input-group">
                                                                <span className="prefix">₹</span>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder={item.placeholder}
                                                                    value={data.spending[item.key]}
                                                                    onChange={e => updateSpending(item.key, e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="total-bar">
                                <span>Total Monthly</span>
                                <span className="total-value">₹{totalSpend.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step">
                            <h2>Preferences</h2>
                            <p className="step-desc">Help us understand your lifestyle</p>

                            <div className="option-group">
                                <label>Reward Type</label>
                                <div className="options">
                                    {['cashback', 'points'].map(v => (
                                        <button
                                            key={v}
                                            className={`option ${data.rewardPreference === v ? 'selected' : ''}`}
                                            onClick={() => setData(d => ({ ...d, rewardPreference: v }))}
                                        >
                                            {v === 'cashback' ? '💵 Cashback' : '⭐ Points'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="option-group">
                                <label>Annual Fee Tolerance</label>
                                <div className="options">
                                    {[
                                        { v: 'zero', l: '₹0' },
                                        { v: 'low', l: '₹1K-3K' },
                                        { v: 'high', l: '₹3K+' },
                                    ].map(item => (
                                        <button
                                            key={item.v}
                                            className={`option ${data.annualFeeTolerance === item.v ? 'selected' : ''}`}
                                            onClick={() => setData(d => ({ ...d, annualFeeTolerance: item.v }))}
                                        >
                                            {item.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="option-group">
                                <label>Lounge Usage</label>
                                <div className="options">
                                    {[
                                        { v: 'never', l: 'Never' },
                                        { v: 'sometimes', l: 'Sometimes' },
                                        { v: 'frequent', l: 'Often' },
                                    ].map(item => (
                                        <button
                                            key={item.v}
                                            className={`option ${data.loungeUsage === item.v ? 'selected' : ''}`}
                                            onClick={() => setData(d => ({ ...d, loungeUsage: item.v }))}
                                        >
                                            {item.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step">
                            <h2>Eligibility (Optional)</h2>
                            <p className="step-desc">For approval probability</p>

                            <div className="input-field">
                                <label>Monthly Income</label>
                                <div className="input-group">
                                    <span className="prefix">₹</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="75000"
                                        value={data.monthlyIncome}
                                        onChange={e => setData(d => ({ ...d, monthlyIncome: e.target.value.replace(/\D/g, '') }))}
                                    />
                                </div>
                            </div>

                            <div className="option-group">
                                <label>Credit Score Range</label>
                                <div className="options vertical">
                                    {[
                                        { v: 'excellent', l: 'Excellent (750+)' },
                                        { v: 'good', l: 'Good (700-749)' },
                                        { v: 'fair', l: 'Fair (650-699)' },
                                        { v: 'poor', l: 'Building (Below 650)' },
                                    ].map(item => (
                                        <button
                                            key={item.v}
                                            className={`option ${data.creditScore === item.v ? 'selected' : ''}`}
                                            onClick={() => setData(d => ({ ...d, creditScore: item.v }))}
                                        >
                                            {item.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step">
                            <h2>Existing Cards (Optional)</h2>
                            <p className="step-desc">Select cards you currently have</p>

                            <div className="card-list">
                                {cards.map(card => (
                                    <button
                                        key={card._id}
                                        className={`card-item ${data.existingCardIds.includes(card._id) ? 'selected' : ''}`}
                                        onClick={() => toggleCard(card._id)}
                                    >
                                        <div className="card-item-info">
                                            <span className="card-item-name">{card.name}</span>
                                            <span className="card-item-bank">{card.bank}</span>
                                        </div>
                                        <span className="card-item-fee">
                                            {card.annualFee === 0 ? 'Free' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                <div className="wizard-nav">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && totalSpend === 0}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Analyzing...
                                </>
                            ) : (
                                'Get Recommendations'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WizardPage;
