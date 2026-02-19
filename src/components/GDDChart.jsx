import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';
import { CONFIG } from '../logic/gddCalculator';

const GDDChart = ({ data }) => {
    return (
        <div className="glass-card col-span-8" style={{ height: '400px' }}>
            <h3 className="text-xl font-bold mb-6">Thermal Accumulation (GDD)</h3>
            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorGdd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="gdd"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorGdd)"
                        strokeWidth={3}
                    />

                    {/* Threshold Lines */}
                    <ReferenceLine y={CONFIG.THRESHOLD_START} stroke="#f59e0b" strokeDasharray="5 5">
                        <Label value="Start of Emergence" position="insideBottomRight" fill="#f59e0b" fontSize={10} />
                    </ReferenceLine>
                    <ReferenceLine y={CONFIG.THRESHOLD_PEAK} stroke="#ef4444" strokeDasharray="5 5">
                        <Label value="Peak Season" position="insideBottomRight" fill="#ef4444" fontSize={10} />
                    </ReferenceLine>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GDDChart;
