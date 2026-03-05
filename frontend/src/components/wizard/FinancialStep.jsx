import React from 'react';
import './FinancialStep.css';

/**
 * FinancialStep Component
 * 
 * Third step (optional) - collects financial information for eligibility.
 */
const FinancialStep = ({ formData, updateFormData }) => {
    const handleIncomeChange = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        updateFormData('monthlyIncome', numericValue);
    };

    return (
        <div className="financial-step">
            <div className="optional-badge">
                <span className="badge badge-info">Optional</span>
            </div>

            <p className="step-description">
                Share your financial info to see which cards you're likely to get approved for.
                <span className="privacy-note">We don't store or share this data.</span>
            </p>

            {/* Monthly Income */}
            <div className="form-group">
                <label htmlFor="monthlyIncome">
                    <span>Monthly Income (Net)</span>
                </label>
                <div className="input-group">
                    <span className="prefix">₹</span>
                    <input
                        id="monthlyIncome"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g., 75000"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleIncomeChange(e.target.value)}
                    />
                </div>
                <p className="hint">Your in-hand salary after deductions</p>
            </div>

            {/* Credit Score */}
            <div className="form-group">
                <label>Credit Score Range</label>
                <p className="hint mb-3">
                    Check your score free on CIBIL, Experian, or credit card apps
                </p>
                <div className="score-options">
                    {[
                        {
                            value: 'excellent',
                            label: 'Excellent',
                            range: '750-900',
                            icon: '🌟',
                            color: 'var(--success)'
                        },
                        {
                            value: 'good',
                            label: 'Good',
                            range: '700-749',
                            icon: '👍',
                            color: 'var(--accent-400)'
                        },
                        {
                            value: 'fair',
                            label: 'Fair',
                            range: '650-699',
                            icon: '📊',
                            color: 'var(--warning)'
                        },
                        {
                            value: 'poor',
                            label: 'Needs Work',
                            range: '300-649',
                            icon: '📈',
                            color: 'var(--danger)'
                        },
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`score-option ${formData.creditScore === option.value ? 'selected' : ''}`}
                            onClick={() => updateFormData('creditScore', option.value)}
                            style={{ '--score-color': option.color }}
                        >
                            <span className="score-icon">{option.icon}</span>
                            <div className="score-info">
                                <span className="score-label">{option.label}</span>
                                <span className="score-range">{option.range}</span>
                            </div>
                            {formData.creditScore === option.value && (
                                <span className="score-check">✓</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skip Notice */}
            <div className="skip-notice">
                <span className="skip-icon">💡</span>
                <p>
                    <strong>Don't know your score?</strong> No problem!
                    We'll still show recommendations. You can skip this step.
                </p>
            </div>
        </div>
    );
};

export default FinancialStep;
