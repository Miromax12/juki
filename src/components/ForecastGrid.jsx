// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { CloudRain, Sun, Thermometer } from 'lucide-react';

const ForecastGrid = ({ forecastData }) => {
    return (
        <div className="glass-card col-span-full">
            <h3 className="text-xl font-bold mb-6">Прогноз на ближайшие 7 дней</h3>
            <div className="forecast-grid">
                {forecastData.map((day, index) => (
                    <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-2xl border ${day.probability > 70
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-white/5 border-white/10'
                            } flex flex-col items-center text-center`}
                    >
                        <p className="text-xs text-muted mb-2">
                            {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                        </p>

                        <div className="my-3">
                            {day.rain ? (
                                <CloudRain className="text-blue-400" size={24} />
                            ) : (
                                <Sun className={day.temp > 23 ? 'text-amber-400' : 'text-yellow-200'} size={24} />
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-sm font-semibold mb-1">
                            <Thermometer size={12} className="text-muted" />
                            <span>{Math.round(day.tMax)}°</span>
                        </div>

                        <div className="mt-2 w-full">
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${day.probability > 70 ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                    style={{ width: `${day.probability}%` }}
                                />
                            </div>
                            <p className="text-[10px] uppercase tracking-tighter mt-1 font-bold">
                                Шанс {day.probability}%
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ForecastGrid;
