/**
 * Spending Categories Configuration and Helpers
 */

export const SPENDING_CATEGORIES = [
    {
        group: 'Food & Dining',
        icon: '🍽️',
        parent: 'food',
        items: [
            { key: 'restaurants', label: 'Restaurants', placeholder: '5000' },
            { key: 'swiggyZomato', label: 'Swiggy/Zomato', placeholder: '4000' },
            { key: 'groceries', label: 'Groceries', placeholder: '6000' },
        ]
    },
    {
        group: 'Fuel',
        icon: '⛽',
        parent: 'fuel',
        items: [
            { key: 'fuel', label: 'Fuel', placeholder: '5000' },
        ]
    },
    {
        group: 'Travel',
        icon: '✈️',
        parent: 'travel',
        items: [
            { key: 'flights', label: 'Flights', placeholder: '5000' },
            { key: 'hotels', label: 'Hotels', placeholder: '3000' },
            { key: 'cabUber', label: 'Cab/Uber', placeholder: '2000' },
        ]
    },
    {
        group: 'Online Shopping',
        icon: '🛒',
        parent: 'online',
        items: [
            { key: 'amazon', label: 'Amazon', placeholder: '8000' },
            { key: 'flipkart', label: 'Flipkart', placeholder: '5000' },
            { key: 'otherOnline', label: 'Other Online', placeholder: '3000' },
        ]
    },
    {
        group: 'Retail & Utilities',
        icon: '🏪',
        parent: 'offline',
        items: [
            { key: 'mallsStores', label: 'Malls/Stores', placeholder: '5000' },
            { key: 'electronics', label: 'Electronics', placeholder: '2000' },
            { key: 'utilities', label: 'Utilities/Bills', placeholder: '5000' },
        ]
    },
];

// Get all sub-category keys for initial state
export const getInitialSpending = () => {
    const spending = {};
    SPENDING_CATEGORIES.forEach(group => {
        group.items.forEach(item => {
            spending[item.key] = '';
        });
    });
    return spending;
};

// Aggregate sub-categories into parent categories for backend
export const aggregateSpending = (spending) => {
    const aggregated = { food: 0, fuel: 0, travel: 0, online: 0, offline: 0 };
    SPENDING_CATEGORIES.forEach(group => {
        group.items.forEach(item => {
            aggregated[group.parent] += parseInt(spending[item.key]) || 0;
        });
    });
    return aggregated;
};

// Calculate total spend for a specific group
export const getGroupTotal = (spending, groupItems) => {
    return groupItems.reduce((total, item) => {
        return total + (parseInt(spending[item.key]) || 0);
    }, 0);
};
