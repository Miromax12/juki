import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 16px',
            }}>
                <p style={{ color: '#94a3b8', marginBottom: 4, fontSize: 13 }}>{label}</p>
                <p style={{ color: '#10b981', fontWeight: 600, fontSize: 15 }}>
                    {payload[0].value.toLocaleString('ru-RU')} наблюдений
                </p>
            </div>
        );
    }
    return null;
};

const SeasonalityChart = ({ data }) => {
    const monthKeys = Object.keys(data).filter(key => !isNaN(parseInt(key)));
    const chartData = monthKeys.map(month => ({
        name: new Date(2000, parseInt(month) - 1, 1).toLocaleString('ru-RU', { month: 'short' }),
        count: data[month]
    }));

    return (
        <div className="glass-card col-span-full" style={{ height: '420px' }}>
            <div className="mb-4">
                <h3 className="text-xl font-bold">Историческая сезонность</h3>
                <p className="text-xs text-muted mt-1">Количество наблюдений по месяцам (данные iNaturalist)</p>
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SeasonalityChart;
