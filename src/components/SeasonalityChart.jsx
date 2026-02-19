import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const SeasonalityChart = ({ data }) => {
    const monthKeys = Object.keys(data).filter(key => !isNaN(parseInt(key)));
    const chartData = monthKeys.map(month => ({
        name: new Date(2000, parseInt(month) - 1, 1).toLocaleString('ru-RU', { month: 'short' }),
        count: data[month]
    }));

    return (
        <div className="glass-card col-span-full" style={{ height: '400px' }}>
            <h3 className="text-xl font-bold mb-6">Историческая сезонность</h3>
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
            <p className="text-xs text-muted mt-4">На основе данных iNaturalist</p>
        </div>
    );
};

export default SeasonalityChart;
