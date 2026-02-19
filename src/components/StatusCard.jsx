// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Thermometer, Wind, Zap } from 'lucide-react';

const StatusCard = ({ gdd, probability, status, location }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-muted uppercase tracking-wider text-xs font-semibold">Текущий статус</h3>
                    <p className="text-2xl font-bold">{location || 'Регион не выбран'}</p>
                </div>
                <div className={`status-indicator ${probability > 50 ? 'status-active' : ''}`} />
            </div>

            <div className="flex items-center gap-12 my-8">
                <div>
                    <div className="flex items-center gap-2 text-muted mb-1">
                        <Thermometer size={16} />
                        <span className="text-xs">Накоплено GDD</span>
                    </div>
                    <p className="text-4xl font-bold text-accent-emerald">{gdd.toFixed(1)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-muted mb-1">
                        <Zap size={16} />
                        <span className="text-xs">Вероятность</span>
                    </div>
                    <p className="text-4xl font-bold text-accent-amber">{probability}%</p>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-lg font-medium leading-relaxed">
                    {status}
                </p>
            </div>

            <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                    <Wind size={14} />
                    <span>Оптимальный вылет: {'>'}23°C</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusCard;
