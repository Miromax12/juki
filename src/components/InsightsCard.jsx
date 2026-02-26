import { motion } from 'framer-motion';
import { CalendarClock, Gauge, TrendingUp, CheckCircle2 } from 'lucide-react';

const DeficitRow = ({ label, deficit, predicted }) => {
    const reached = deficit === 0;
    return (
        <div className="insight-deficit-row">
            <div className="insight-deficit-header">
                <span className="insight-deficit-label">{label}</span>
                {reached ? (
                    <span className="insight-badge-reached">
                        <CheckCircle2 size={12} /> Достигнуто
                    </span>
                ) : (
                    <span className="insight-deficit-value">−{deficit.toFixed(0)} GDD</span>
                )}
            </div>
            {!reached && predicted.date && (
                <div className="insight-prediction-row">
                    <CalendarClock size={12} className="text-muted" />
                    <span className="insight-pred-date">{predicted.date}</span>
                    <span className="insight-pred-days">через {predicted.daysLeft} дн.</span>
                </div>
            )}
            {!reached && !predicted.date && (
                <p className="insight-no-rate">Недостаточно данных для прогноза</p>
            )}
        </div>
    );
};

const InsightsCard = ({ deficits, emergencePrediction, peakPrediction, gddRate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card col-span-4"
        >
            <h3 className="text-xl font-bold mb-6">Прогноз GDD</h3>

            <div className="insight-sections">
                <DeficitRow
                    label="До начала вылета"
                    deficit={deficits.toEmergence}
                    predicted={emergencePrediction}
                />
                <DeficitRow
                    label="До пика сезона"
                    deficit={deficits.toPeak}
                    predicted={peakPrediction}
                />
            </div>

            <div className="insight-rate-row">
                <div className="insight-rate-icon">
                    <TrendingUp size={16} />
                </div>
                <div>
                    <p className="insight-rate-label">Скорость накопления</p>
                    <p className="insight-rate-value">{gddRate.toFixed(1)} <span className="insight-rate-unit">GDD / день</span></p>
                </div>
            </div>
        </motion.div>
    );
};

export default InsightsCard;
