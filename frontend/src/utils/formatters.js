/**
 * Formatting Utilities
 * 
 * Helper functions for formatting currency, numbers, and text.
 */

/**
 * Format number as Indian currency (INR)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === null || amount === undefined) return '-';

    // Use Indian numbering system (lakhs, crores)
    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(Math.abs(amount));

    const sign = amount < 0 ? '-' : '';
    const symbol = showSymbol ? '₹' : '';

    return `${sign}${symbol}${formatted}`;
};

/**
 * Format number as Indian currency with sign indicator
 * @param {number} amount - Amount to format
 * @returns {Object} Formatted string and CSS class
 */
export const formatCurrencyWithSign = (amount) => {
    const formatted = formatCurrency(Math.abs(amount));

    if (amount > 0) {
        return {
            text: `+${formatted}`,
            className: 'currency-positive',
            isPositive: true,
        };
    } else if (amount < 0) {
        return {
            text: `-${formatted}`,
            className: 'currency-negative',
            isPositive: false,
        };
    } else {
        return {
            text: formatted,
            className: '',
            isPositive: null,
        };
    }
};

/**
 * Format number with Indian numbering system
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';

    return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';

    return `${value.toFixed(decimals)}%`;
};

/**
 * Get approval probability badge info
 * @param {string} probability - 'high', 'medium', 'low', or 'unknown'
 * @returns {Object} Badge configuration
 */
export const getApprovalBadge = (probability) => {
    const badges = {
        high: {
            label: 'High Approval Chance',
            className: 'badge-success',
            icon: '✓',
        },
        medium: {
            label: 'Medium Chance',
            className: 'badge-warning',
            icon: '~',
        },
        low: {
            label: 'Low Chance',
            className: 'badge-danger',
            icon: '✗',
        },
        unknown: {
            label: 'Unknown',
            className: 'badge-neutral',
            icon: '?',
        },
    };

    return badges[probability] || badges.unknown;
};

/**
 * Get warning severity badge info
 * @param {string} severity - 'info', 'warning', or 'critical'
 * @returns {Object} Badge configuration
 */
export const getWarningSeverity = (severity) => {
    const severities = {
        info: {
            className: 'badge-info',
            icon: 'ℹ',
            color: 'var(--info)',
        },
        warning: {
            className: 'badge-warning',
            icon: '⚠',
            color: 'var(--warning)',
        },
        critical: {
            className: 'badge-danger',
            icon: '⚠',
            color: 'var(--danger)',
        },
    };

    return severities[severity] || severities.warning;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Convert category key to display name
 * @param {string} category - Category key
 * @returns {string} Display name
 */
export const getCategoryDisplayName = (category) => {
    const names = {
        food: 'Food & Dining',
        fuel: 'Fuel',
        travel: 'Travel',
        online: 'Online Shopping',
        offline: 'Retail Shopping',
    };

    return names[category] || category;
};

/**
 * Get credit score range description
 * @param {string} score - Score key
 * @returns {string} Score range description
 */
export const getCreditScoreRange = (score) => {
    const ranges = {
        poor: '300-649',
        fair: '650-699',
        good: '700-749',
        excellent: '750-900',
    };

    return ranges[score] || 'Unknown';
};

/**
 * Calculate percentage of total
 * @param {number} value - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
};
