import React from 'react';
import { getWarningSeverity } from '../../utils/formatters';
import './WarningsList.css';

/**
 * WarningsList Component
 * 
 * Displays warnings about potential issues with a card.
 */
const WarningsList = ({ warnings }) => {
    if (!warnings || warnings.length === 0) {
        return null;
    }

    return (
        <div className="warnings-list">
            {warnings.map((warning, index) => {
                const severity = getWarningSeverity(warning.severity);

                return (
                    <div
                        key={index}
                        className={`warning-item ${warning.severity}`}
                    >
                        <span className="warning-icon">{severity.icon}</span>
                        <p className="warning-message">{warning.message}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default WarningsList;
