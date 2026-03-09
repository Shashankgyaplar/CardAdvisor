/**
 * Seed Data for Indian Credit Cards
 * 
 * Contains curated data for 15 popular Indian credit cards.
 * Data is based on publicly available information from bank websites.
 * 
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CreditCard = require('../models/CreditCard');
const connectDB = require('../config/db');

/**
 * Credit card seed data
 * All monetary values in INR
 */
const creditCards = [
    // ============ HDFC BANK ============
    {
        name: 'HDFC Infinia',
        bank: 'HDFC Bank',
        cardNetwork: 'Visa',
        annualFee: 10000,
        joiningFee: 10000,
        feeWaiverSpend: 1000000,
        rewardType: 'points',
        rewards: {
            food: 5,
            fuel: 5,
            travel: 5,
            online: 5,
            offline: 5,
            default: 5
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 12,
            international: 6
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 175000,
            minCreditScore: 750
        },
        benefits: [
            '5X reward points on all spends',
            'Unlimited airport lounge access',
            '1:1 air miles transfer',
            'Golf privileges',
            'Premium concierge service'
        ],
        bestFor: 'High spenders and frequent international travelers',
        isActive: true
    },
    {
        name: 'HDFC Regalia',
        bank: 'HDFC Bank',
        cardNetwork: 'Visa',
        annualFee: 2500,
        joiningFee: 2500,
        feeWaiverSpend: 300000,
        rewardType: 'points',
        rewards: {
            food: 4,
            fuel: 4,
            travel: 4,
            online: 4,
            offline: 4,
            default: 4
        },
        pointValue: 0.5,
        loungeAccess: {
            domestic: 12,
            international: 6
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 100000,
            minCreditScore: 720
        },
        benefits: [
            '4X reward points on all spends',
            'Complimentary lounge access',
            'Travel insurance up to ₹1 Cr',
            'Milestone benefits'
        ],
        bestFor: 'Travelers seeking premium benefits at moderate fees',
        isActive: true
    },
    {
        name: 'HDFC Millennia',
        bank: 'HDFC Bank',
        cardNetwork: 'Mastercard',
        annualFee: 1000,
        joiningFee: 1000,
        feeWaiverSpend: 100000,
        rewardType: 'cashback',
        rewards: {
            food: 1,
            fuel: 1,
            travel: 1,
            online: 5,
            offline: 1,
            default: 1
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 8,
            international: 0
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 35000,
            minCreditScore: 700
        },
        benefits: [
            '5% cashback on Amazon, Flipkart, Myntra',
            '2.5% cashback on online spends',
            '1% cashback on offline and wallet spends',
            'Complimentary domestic lounge access'
        ],
        bestFor: 'Young professionals who shop online frequently',
        isActive: true
    },

    // ============ SBI CARDS ============
    {
        name: 'SBI Student Plus Advantage',
        bank: 'SBI Card',
        cardNetwork: 'Visa',
        annualFee: 0,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'points',
        rewards: {
            food: 1,
            fuel: 2.5,
            travel: 1,
            online: 1,
            offline: 1,
            default: 1
        },
        pointValue: 0.25,
        loungeAccess: {
            domestic: 0,
            international: 0
        },
        loungeValuePerVisit: 0,
        eligibility: {
            minMonthlyIncome: 0,
            minCreditScore: 300 // Accessible to absolute beginners
        },
        benefits: [
            'Lifetime free card for students',
            '1X Reward Points on most spends',
            '2.5% Value back on grocery and fuel',
            'Education loan integration'
        ],
        bestFor: 'College students looking for their first credit card',
        isActive: true
    },
    {
        name: 'SBI SimplyCLICK',
        bank: 'SBI Card',
        cardNetwork: 'Visa',
        annualFee: 499,
        joiningFee: 499,
        feeWaiverSpend: 100000,
        rewardType: 'points',
        rewards: {
            food: 2.5,
            fuel: 1,
            travel: 2.5,
            online: 10,
            offline: 1,
            default: 1
        },
        pointValue: 0.25,
        loungeAccess: {
            domestic: 4,
            international: 0
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 30000,
            minCreditScore: 680
        },
        benefits: [
            '10X rewards on partner sites (Amazon, Cleartrip, etc.)',
            '5X rewards on online shopping',
            'E-vouchers worth ₹500 on joining',
            'Annual fee reversal on ₹1L+ spend'
        ],
        bestFor: 'Online shoppers looking for value with low fees',
        isActive: true
    },
    {
        name: 'SBI Prime',
        bank: 'SBI Card',
        cardNetwork: 'Mastercard',
        annualFee: 2999,
        joiningFee: 2999,
        feeWaiverSpend: 300000,
        rewardType: 'points',
        rewards: {
            food: 5,
            fuel: 2,
            travel: 4,
            online: 4,
            offline: 2,
            default: 2
        },
        pointValue: 0.25,
        loungeAccess: {
            domestic: 8,
            international: 4
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 60000,
            minCreditScore: 720
        },
        benefits: [
            '5X rewards on dining',
            '4X rewards on travel and online shopping',
            'Complimentary lounge access',
            'Movie ticket offers',
            'Fuel surcharge waiver'
        ],
        bestFor: 'Food enthusiasts and frequent diners',
        isActive: true
    },

    // ============ ICICI BANK ============
    {
        name: 'ICICI Amazon Pay',
        bank: 'ICICI Bank',
        cardNetwork: 'Visa',
        annualFee: 500,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'cashback',
        rewards: {
            food: 1,
            fuel: 1,
            travel: 1,
            online: 2,
            offline: 1,
            default: 1
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 0,
            international: 0
        },
        loungeValuePerVisit: 0,
        eligibility: {
            minMonthlyIncome: 25000,
            minCreditScore: 680
        },
        specialPartners: [
            { name: 'Amazon', rewardRate: 5, description: '5% cashback on Amazon with Prime' },
            { name: 'Amazon (non-Prime)', rewardRate: 3, description: '3% cashback without Prime' }
        ],
        benefits: [
            '5% cashback on Amazon (Prime members)',
            '3% cashback on Amazon (non-Prime)',
            '2% cashback on digital payments',
            '1% cashback on other spends',
            'No joining fee'
        ],
        bestFor: 'Amazon Prime members and regular Amazon shoppers',
        isActive: true
    },
    {
        name: 'ICICI Sapphiro',
        bank: 'ICICI Bank',
        cardNetwork: 'Visa',
        annualFee: 3500,
        joiningFee: 3500,
        feeWaiverSpend: 500000,
        rewardType: 'points',
        rewards: {
            food: 4,
            fuel: 2,
            travel: 4,
            online: 4,
            offline: 2,
            default: 2
        },
        pointValue: 0.5,
        loungeAccess: {
            domestic: 12,
            international: 4
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 75000,
            minCreditScore: 720
        },
        benefits: [
            '4X rewards on travel, dining, and entertainment',
            'Unlimited domestic lounge access',
            'International lounge access',
            'Golf privileges',
            'Comprehensive travel insurance'
        ],
        bestFor: 'Lifestyle spenders who value lounge access',
        isActive: true
    },

    // ============ AXIS BANK ============
    {
        name: 'Axis Flipkart',
        bank: 'Axis Bank',
        cardNetwork: 'Mastercard',
        annualFee: 500,
        joiningFee: 500,
        feeWaiverSpend: null,
        rewardType: 'cashback',
        rewards: {
            food: 1.5,
            fuel: 1,
            travel: 1.5,
            online: 1.5,
            offline: 1.5,
            default: 1.5
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 4,
            international: 0
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 25000,
            minCreditScore: 680
        },
        specialPartners: [
            { name: 'Flipkart', rewardRate: 5, description: '5% unlimited cashback on Flipkart' },
            { name: 'Myntra', rewardRate: 4, description: '4% cashback on Myntra' }
        ],
        benefits: [
            '5% cashback on Flipkart',
            '4% cashback on Preferred Partners (Myntra, 2GUD, Cleartrip)',
            '1.5% cashback on all other spends',
            'Welcome benefits worth ₹500'
        ],
        bestFor: 'Flipkart shoppers and bargain hunters',
        isActive: true
    },
    {
        name: 'Axis Magnus',
        bank: 'Axis Bank',
        cardNetwork: 'Visa',
        annualFee: 10000,
        joiningFee: 10000,
        feeWaiverSpend: 1500000,
        rewardType: 'points',
        rewards: {
            food: 12,
            fuel: 12,
            travel: 35,
            online: 12,
            offline: 12,
            default: 12
        },
        pointValue: 0.5,
        loungeAccess: {
            domestic: 16,
            international: 8
        },
        loungeValuePerVisit: 1500,
        eligibility: {
            minMonthlyIncome: 150000,
            minCreditScore: 750
        },
        benefits: [
            '12 Edge Points per ₹200 (6% value)',
            '35 Points per ₹200 on travel',
            'Unlimited lounge access worldwide',
            'Meet & Greet at airports',
            'Premium concierge'
        ],
        bestFor: 'Ultra-premium travelers seeking maximum travel rewards',
        isActive: true
    },

    // ============ AMEX ============
    {
        name: 'Amex Platinum Travel',
        bank: 'American Express',
        cardNetwork: 'Amex',
        annualFee: 3500,
        joiningFee: 3500,
        feeWaiverSpend: 400000,
        rewardType: 'points',
        rewards: {
            food: 1,
            fuel: 1,
            travel: 5,
            online: 1,
            offline: 1,
            default: 1
        },
        pointValue: 0.5,
        loungeAccess: {
            domestic: 4,
            international: 4
        },
        loungeValuePerVisit: 1500,
        eligibility: {
            minMonthlyIncome: 50000,
            minCreditScore: 720
        },
        benefits: [
            '5X membership rewards on travel',
            'Complimentary Taj InnerCircle Gold',
            'Comprehensive travel insurance',
            'Global lounge access',
            'Amex Offers and deals'
        ],
        bestFor: 'Frequent travelers who prefer premium travel experiences',
        isActive: true
    },

    // ============ HSBC ============
    {
        name: 'HSBC Cashback',
        bank: 'HSBC',
        cardNetwork: 'Visa',
        annualFee: 750,
        joiningFee: 750,
        feeWaiverSpend: 100000,
        rewardType: 'cashback',
        rewards: {
            food: 1.5,
            fuel: 1.5,
            travel: 1.5,
            online: 1.5,
            offline: 1.5,
            default: 1.5
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 0,
            international: 0
        },
        loungeValuePerVisit: 0,
        eligibility: {
            minMonthlyIncome: 40000,
            minCreditScore: 700
        },
        benefits: [
            '1.5% unlimited cashback on all spends',
            'No capping on cashback',
            'Low annual fee',
            'Fuel surcharge waiver'
        ],
        bestFor: 'Simple cashback seekers who want predictable rewards',
        isActive: true
    },

    // ============ INDUSIND BANK ============
    {
        name: 'IndusInd Legend',
        bank: 'IndusInd Bank',
        cardNetwork: 'Visa',
        annualFee: 0,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'points',
        rewards: {
            food: 2,
            fuel: 1,
            travel: 2,
            online: 2,
            offline: 2,
            default: 2
        },
        pointValue: 0.5,
        loungeAccess: {
            domestic: 4,
            international: 2
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 100000,
            minCreditScore: 720
        },
        benefits: [
            'Lifetime free card',
            'Complimentary golf games',
            'Domestic and international lounge access',
            '2X reward points',
            'Fuel surcharge waiver'
        ],
        bestFor: 'High-income individuals seeking lifetime free premium card',
        isActive: true
    },

    // ============ YES BANK ============
    {
        name: 'Yes First Preferred',
        bank: 'Yes Bank',
        cardNetwork: 'Mastercard',
        annualFee: 1499,
        joiningFee: 0,
        feeWaiverSpend: 250000,
        rewardType: 'points',
        rewards: {
            food: 3,
            fuel: 2,
            travel: 6,
            online: 3,
            offline: 2,
            default: 2
        },
        pointValue: 0.25,
        loungeAccess: {
            domestic: 8,
            international: 2
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 50000,
            minCreditScore: 700
        },
        benefits: [
            '6X rewards on travel',
            '3X rewards on dining and online shopping',
            'Airport lounge access',
            'Travel insurance',
            'Joining fee waiver'
        ],
        bestFor: 'First-time premium card seekers with travel focus',
        isActive: true
    },

    // ============ RBL BANK ============
    {
        name: 'RBL ShopRite',
        bank: 'RBL Bank',
        cardNetwork: 'Mastercard',
        annualFee: 0,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'cashback',
        rewards: {
            food: 1,
            fuel: 0.5,
            travel: 1,
            online: 2,
            offline: 1,
            default: 1
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 0,
            international: 0
        },
        loungeValuePerVisit: 0,
        eligibility: {
            minMonthlyIncome: 20000,
            minCreditScore: 650
        },
        benefits: [
            'Lifetime free card',
            '2% cashback on online shopping',
            '1% cashback on other spends',
            'Fuel surcharge waiver',
            'Easy EMI conversion'
        ],
        bestFor: 'Budget-conscious shoppers seeking zero-fee card',
        isActive: true
    },

    // ============ KOTAK MAHINDRA ============
    {
        name: 'Kotak 811 Dream Different',
        bank: 'Kotak Mahindra Bank',
        cardNetwork: 'Visa',
        annualFee: 0,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'cashback',
        rewards: {
            food: 1,
            fuel: 0.5,
            travel: 1,
            online: 1,
            offline: 1,
            default: 1
        },
        pointValue: 1,
        loungeAccess: {
            domestic: 2,
            international: 0
        },
        loungeValuePerVisit: 1200,
        eligibility: {
            minMonthlyIncome: 15000,
            minCreditScore: 650
        },
        benefits: [
            'Lifetime free card',
            '1% cashback on all spends',
            'Limited lounge access',
            'Low income requirement',
            'Instant approval for 811 customers'
        ],
        bestFor: 'Entry-level cardholders seeking basic rewards with no fees',
        isActive: true
    },

    // ============ IDFC FIRST BANK ============
    {
        name: 'IDFC FIRST WOW!',
        bank: 'IDFC FIRST Bank',
        cardNetwork: 'Visa',
        annualFee: 0,
        joiningFee: 0,
        feeWaiverSpend: null,
        rewardType: 'points',
        rewards: {
            food: 4,
            fuel: 0, // No rewards on fuel typically
            travel: 4,
            online: 4,
            offline: 4,
            default: 4
        },
        pointValue: 0.25,
        loungeAccess: {
            domestic: 0,
            international: 0
        },
        loungeValuePerVisit: 0,
        eligibility: {
            minMonthlyIncome: 0, // Secured card based on FD
            minCreditScore: 300 // No credit history required
        },
        benefits: [
            'Lifetime free secured credit card',
            'No income proof or credit history required',
            'Earn 4X Reward Points on all spends',
            'Zero forex markup fee',
            'Helps build credit score'
        ],
        bestFor: 'Students, homemakers, or anyone without active income source',
        isActive: true
    }
];

/**
 * Seed the database with credit cards
 */
const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing cards
        console.log('🗑️  Clearing existing credit cards...');
        await CreditCard.deleteMany({});

        // Insert new cards
        console.log('📝 Inserting credit cards...');
        const result = await CreditCard.insertMany(creditCards);

        console.log(`✅ Successfully seeded ${result.length} credit cards:`);
        result.forEach((card, index) => {
            console.log(`   ${index + 1}. ${card.name} (${card.bank}) - ₹${card.annualFee}/year`);
        });

        // Disconnect
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { creditCards, seedDatabase };
