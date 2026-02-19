import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const SeasonalityChart = ({ data }) => {
    // data format: { "1": 10, "2": 5, ... }
    const chartData = Object.keys(data).map(month => ({
        name: new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'short' }),
        count: data[month]
    }));

    return (
        <div className="glass-card col-span-4" style={{ height: '400px' }}>
            <h3 className="text-xl font-bold mb-6">Historical Seasonality</h3>
            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ borderRadius: '12px' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        opacity={0.6}
                    />
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted mt-4">Based on iNaturalist research-grade data</p>
        </div>
    );
};

export default SeasonalityChart;
