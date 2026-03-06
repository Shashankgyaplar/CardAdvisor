import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import './RewardBreakdownChart.css';

// Chart colors matching the design system
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{data.name}</p>
                <p className="tooltip-value">{formatCurrency(data.value)}</p>
                <p className="tooltip-percent">{data.percent}% of total</p>
            </div>
        );
    }
    return null;
};

const RewardBreakdownChart = ({ breakdown, type = 'pie' }) => {
    if (!breakdown) return null;

    // Transform breakdown data for charts
    const categoryMap = {
        foodRewards: { name: 'Food & Dining', icon: '🍔' },
        fuelRewards: { name: 'Fuel', icon: '⛽' },
        travelRewards: { name: 'Travel', icon: '✈️' },
        onlineRewards: { name: 'Online Shopping', icon: '🛒' },
        offlineRewards: { name: 'Retail', icon: '🏪' },
        loungeValue: { name: 'Lounge Access', icon: '✨' },
    };

    const chartData = Object.entries(categoryMap)
        .filter(([key]) => breakdown[key] > 0)
        .map(([key, { name, icon }]) => ({
            key,
            name: `${icon} ${name}`,
            shortName: name,
            value: breakdown[key],
            icon,
        }));

    // Calculate percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
        item.percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
    });

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No reward data to display</p>
            </div>
        );
    }

    return (
        <div className="reward-chart">
            <h3 className="chart-title">
                📊 Reward Breakdown
            </h3>

            <div className="chart-container">
                {type === 'pie' ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ cx, cy, midAngle, outerRadius, payload }) => {
                                    // Use the pre-calculated percentage from the payload
                                    const slicePercent = payload.percent || 0;

                                    // Hide labels for slices less than 5% to prevent overlap
                                    if (slicePercent < 5) return null;

                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius * 1.15;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    return (
                                        <text
                                            x={x}
                                            y={y}
                                            fill="var(--text-secondary)"
                                            textAnchor={x > cx ? 'start' : 'end'}
                                            dominantBaseline="central"
                                            fontSize="12"
                                            fontWeight="500"
                                        >
                                            {`${payload.shortName} ${slicePercent}%`}
                                        </text>
                                    );
                                }}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="var(--bg-card)"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                                stroke="var(--text-muted)"
                            />
                            <YAxis
                                type="category"
                                dataKey="shortName"
                                width={90}
                                stroke="var(--text-muted)"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                radius={[0, 4, 4, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend */}
            <div className="chart-legend">
                {chartData.map((item, index) => (
                    <div key={item.key} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="chart-total">
                <span>Total Rewards</span>
                <span className="total-value">{formatCurrency(total)}</span>
            </div>
        </div>
    );
};

export default RewardBreakdownChart;
