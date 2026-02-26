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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, ease: 'easeOut' }}
                        className={`forecast-card ${day.probability > 70 ? 'forecast-card-active' : ''}`}
                    >
                        <p className="forecast-date">
                            {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                        </p>

                        <div className="forecast-icon">
                            {day.rain ? (
                                <CloudRain className="text-blue-400" size={24} />
                            ) : (
                                <Sun className={day.temp > 23 ? 'text-amber-400' : 'text-yellow-200'} size={24} />
                            )}
                        </div>

                        <div className="forecast-temp">
                            <Thermometer size={12} className="text-muted" />
                            <span>{Math.round(day.tMax)}°</span>
                        </div>

                        <div className="forecast-prob-wrap">
                            <div className="forecast-prob-track">
                                <motion.div
                                    className={`forecast-prob-fill ${day.probability > 70 ? 'prob-high' : 'prob-low'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${day.probability}%` }}
                                    transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <p className="forecast-prob-label">Шанс {day.probability}%</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ForecastGrid;
