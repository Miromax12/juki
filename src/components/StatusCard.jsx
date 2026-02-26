import { motion } from 'framer-motion';
import { Thermometer, Wind, TrendingUp } from 'lucide-react';

const StatusCard = ({ gdd, probability, status, location, species }) => {
    const progressToStart = Math.min(100, (gdd / species.thresholdStart) * 100);
    const isEmergence = gdd >= species.thresholdStart;
    const progressToPeak = isEmergence
        ? Math.min(100, ((gdd - species.thresholdStart) / (species.thresholdPeak - species.thresholdStart)) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="status-label">Текущий статус</h3>
                    <p className="text-2xl font-bold">{location || 'Регион не выбран'}</p>
                </div>
                <div className={`status-indicator ${probability > 50 ? 'status-active' : ''}`} />
            </div>

            <div className="status-metrics">
                <div>
                    <div className="metric-label">
                        <Thermometer size={16} />
                        <span>Накоплено GDD</span>
                    </div>
                    <p className="metric-value text-accent-emerald">{gdd.toFixed(1)}</p>
                </div>
                <div>
                    <div className="metric-label">
                        <TrendingUp size={16} />
                        <span>Вероятность</span>
                    </div>
                    <p className="metric-value text-accent-amber">{probability}%</p>
                </div>
            </div>

            <div className="gdd-progress-section">
                <div className="gdd-progress-header">
                    <span>До начала вылета</span>
                    <span className="gdd-progress-value">{gdd.toFixed(0)} / {species.thresholdStart}</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill progress-emerald" style={{ width: `${progressToStart}%` }} />
                </div>

                {isEmergence && (
                    <>
                        <div className="gdd-progress-header" style={{ marginTop: '0.75rem' }}>
                            <span>До пика сезона</span>
                            <span className="gdd-progress-value">{gdd.toFixed(0)} / {species.thresholdPeak}</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill progress-amber" style={{ width: `${progressToPeak}%` }} />
                        </div>
                    </>
                )}
            </div>

            <div className="status-message">
                <p>{status}</p>
            </div>

            <div className="mt-6">
                <div className="metric-label">
                    <Wind size={14} />
                    <span>Оптимальный вылет: {'>'}{species.optimalTemp}°C</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusCard;
