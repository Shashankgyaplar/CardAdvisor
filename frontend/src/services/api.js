/**
 * API Service
 * 
 * Handles all HTTP requests to the backend API.
 */

import axios from 'axios';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Card API endpoints
 */
export const cardAPI = {
    /**
     * Get all credit cards
     * @param {Object} params - Query parameters (bank, rewardType, maxFee, minIncome)
     */
    getAll: (params = {}) => api.get('/cards', { params }),

    /**
     * Get card by ID
     * @param {string} id - Card ID
     */
    getById: (id) => api.get(`/cards/${id}`),

    /**
     * Get cards by bank name
     * @param {string} bankName - Bank name
     */
    getByBank: (bankName) => api.get(`/cards/bank/${bankName}`),

    /**
     * Get all bank names
     */
    getBanks: () => api.get('/cards/banks'),

    /**
     * Get cards by fee tolerance
     * @param {string} tolerance - 'zero', 'low', or 'high'
     */
    getByFeeTolerance: (tolerance) => api.get(`/cards/fee/${tolerance}`),
};

/**
 * Recommendation API endpoints
 */
export const recommendationAPI = {
    /**
     * Generate recommendations based on user input
     * @param {Object} userInput - User input data
     */
    generate: (userInput) => api.post('/recommendations', userInput),

    /**
     * Get recommendation by ID
     * @param {string} id - Recommendation ID
     */
    getById: (id) => api.get(`/recommendations/${id}`),

    /**
     * Quick calculate benefit for a single card
     * @param {Object} data - { cardId, spending, loungeUsage }
     */
    quickCalculate: (data) => api.post('/recommendations/calculate', data),

    /**
     * Compare multiple cards
     * @param {Object} data - { cardIds, spending, loungeUsage }
     */
    compare: (data) => api.post('/recommendations/compare', data),
};

/**
 * Health check
 */
export const healthCheck = () => api.get('/health');

export default api;
