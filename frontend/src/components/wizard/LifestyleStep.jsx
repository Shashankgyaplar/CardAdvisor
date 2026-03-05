import React from 'react';
import './LifestyleStep.css';

/**
 * LifestyleStep Component
 * 
 * Second step - collects lifestyle preferences.
 */
const LifestyleStep = ({ formData, updateFormData }) => {
    return (
        <div className="lifestyle-step">
            <p className="step-description">
                Tell us about your lifestyle to find cards that match your needs.
            </p>

            {/* Travel Frequency */}
            <div className="form-group">
                <label>How often do you travel?</label>
                <div className="option-cards">
                    {[
                        { value: 'rare', icon: '🏠', label: 'Rarely', desc: '1-2 trips/year' },
                        { value: 'occasional', icon: '🚗', label: 'Occasionally', desc: '3-6 trips/year' },
                        { value: 'frequent', icon: '✈️', label: 'Frequently', desc: '7+ trips/year' },
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`option-card ${formData.travelFrequency === option.value ? 'selected' : ''}`}
                            onClick={() => updateFormData('travelFrequency', option.value)}
                        >
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lounge Usage */}
            <div className="form-group">
                <label>Do you use airport lounges?</label>
                <div className="option-cards">
                    {[
                        { value: 'never', icon: '❌', label: 'Never', desc: "Don't use lounges" },
                        { value: 'sometimes', icon: '☕', label: 'Sometimes', desc: '2-4 times/year' },
                        { value: 'frequent', icon: '🍾', label: 'Frequently', desc: 'Every trip' },
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`option-card ${formData.loungeUsage === option.value ? 'selected' : ''}`}
                            onClick={() => updateFormData('loungeUsage', option.value)}
                        >
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reward Preference */}
            <div className="form-group">
                <label>What type of rewards do you prefer?</label>
                <div className="option-cards two-col">
                    {[
                        {
                            value: 'cashback',
                            icon: '💵',
                            label: 'Cashback',
                            desc: 'Direct money back on spends'
                        },
                        {
                            value: 'points',
                            icon: '⭐',
                            label: 'Reward Points',
                            desc: 'Redeem for travel, products'
                        },
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`option-card ${formData.rewardPreference === option.value ? 'selected' : ''}`}
                            onClick={() => updateFormData('rewardPreference', option.value)}
                        >
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Annual Fee Tolerance */}
            <div className="form-group">
                <label>How much annual fee are you comfortable with?</label>
                <div className="option-cards">
                    {[
                        {
                            value: 'zero',
                            icon: '🆓',
                            label: '₹0 Only',
                            desc: 'No annual fee cards'
                        },
                        {
                            value: 'low',
                            icon: '💰',
                            label: '₹1K - ₹3K',
                            desc: 'Mid-range cards'
                        },
                        {
                            value: 'high',
                            icon: '💎',
                            label: '₹3K+',
                            desc: 'Premium cards'
                        },
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`option-card ${formData.annualFeeTolerance === option.value ? 'selected' : ''}`}
                            onClick={() => updateFormData('annualFeeTolerance', option.value)}
                        >
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LifestyleStep;
