import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{label}</p>
                <p className="chart-tooltip-value">{payload[0].value.toFixed(1)} GDD</p>
            </div>
        );
    }
    return null;
};

const GDDChart = ({ data, config }) => {
    return (
        <div className="glass-card col-span-8 gdd-chart-card">
            <h3 className="text-xl font-bold mb-6">Накопление тепла (GDD)</h3>
            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorGdd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="gdd"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorGdd)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                    />

                    <ReferenceLine y={config.thresholdStart} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5}>
                        <Label value="Начало вылета" position="insideBottomRight" fill="#f59e0b" fontSize={10} />
                    </ReferenceLine>
                    <ReferenceLine y={config.thresholdPeak} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5}>
                        <Label value="Пик сезона" position="insideBottomRight" fill="#ef4444" fontSize={10} />
                    </ReferenceLine>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GDDChart;
