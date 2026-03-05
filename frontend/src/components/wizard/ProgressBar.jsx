import React from 'react';
import './ProgressBar.css';

/**
 * ProgressBar Component
 * 
 * Visual progress indicator for the wizard steps.
 */
const ProgressBar = ({ steps, currentStep }) => {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="progress-container">
            {/* Progress track */}
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Step indicators */}
            <div className="progress-steps">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`progress-step ${step.id < currentStep ? 'completed' : ''
                            } ${step.id === currentStep ? 'active' : ''}`}
                    >
                        <div className="step-circle">
                            {step.id < currentStep ? (
                                <span className="check">✓</span>
                            ) : (
                                <span className="number">{step.id}</span>
                            )}
                        </div>
                        <span className="step-name">{step.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;
