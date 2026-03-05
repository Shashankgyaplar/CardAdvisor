import React from 'react';
import './SpendingStep.css';

/**
 * SpendingStep Component
 * 
 * First step of the wizard - collects monthly spending data.
 */
const SpendingStep = ({ spending, updateSpending }) => {
    const categories = [
        {
            key: 'food',
            label: 'Food & Dining',
            icon: '🍽️',
            description: 'Restaurants, food delivery, groceries',
            placeholder: '15000',
        },
        {
            key: 'fuel',
            label: 'Fuel',
            icon: '⛽',
            description: 'Petrol, diesel, EV charging',
            placeholder: '5000',
        },
        {
            key: 'travel',
            label: 'Travel',
            icon: '✈️',
            description: 'Flights, hotels, train tickets',
            placeholder: '10000',
        },
        {
            key: 'online',
            label: 'Online Shopping',
            icon: '🛒',
            description: 'Amazon, Flipkart, Myntra, etc.',
            placeholder: '20000',
        },
        {
            key: 'offline',
            label: 'Retail Shopping',
            icon: '🏪',
            description: 'Malls, local stores, department stores',
            placeholder: '8000',
        },
    ];

    const totalSpending = Object.values(spending).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
    );

    const handleInputChange = (key, value) => {
        // Allow only numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        updateSpending(key, numericValue);
    };

    return (
        <div className="spending-step">
            <p className="step-description">
                Enter your approximate monthly spending in each category.
                This helps us calculate the exact rewards you'd earn.
            </p>

            <div className="spending-grid">
                {categories.map((category) => (
                    <div key={category.key} className="spending-item">
                        <label htmlFor={category.key}>
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-label">{category.label}</span>
                        </label>
                        <p className="category-description">{category.description}</p>
                        <div className="input-group">
                            <span className="prefix">₹</span>
                            <input
                                id={category.key}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={category.placeholder}
                                value={spending[category.key]}
                                onChange={(e) => handleInputChange(category.key, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Display */}
            <div className="spending-total">
                <div className="total-label">
                    <span>Total Monthly Spending</span>
                    <span className="total-hint">This is what you spend on credit card</span>
                </div>
                <div className="total-value">
                    ₹{totalSpending.toLocaleString('en-IN')}
                </div>
            </div>

            {/* Yearly projection */}
            <div className="yearly-projection">
                <span className="projection-label">Yearly spending:</span>
                <span className="projection-value">
                    ₹{(totalSpending * 12).toLocaleString('en-IN')}
                </span>
            </div>
        </div>
    );
};

export default SpendingStep;
