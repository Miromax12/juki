import { useState, useEffect } from 'react';
import { fetchSeasonality } from './services/inaturalist';
import { fetchWeatherData } from './services/weather';
import { calculateCumulativeGDD, predictEmergence } from './logic/gddCalculator';
import StatusCard from './components/StatusCard';
import GDDChart from './components/GDDChart';
import SeasonalityChart from './components/SeasonalityChart';
import ForecastGrid from './components/ForecastGrid';
import './styles/index.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState([]);
  const [seasonalityData, setSeasonalityData] = useState({});
  const [location] = useState('Kyiv, Ukraine');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // 1. Fetch historical seasonality
        const seasonality = await fetchSeasonality();
        setSeasonalityData(seasonality);

        // 2. Fetch weather data (Start of year to +7 days forecast)
        const now = new Date();
        const startOfYear = `${now.getFullYear()}-01-01`;

        const forecastDate = new Date();
        forecastDate.setDate(now.getDate() + 7);
        const endDate = forecastDate.toISOString().split('T')[0];

        const weather = await fetchWeatherData(location, startOfYear, endDate);
        setWeatherData(weather);

        setLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    }
    init();
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d] text-white">
        <div className="text-center">
          <div className="status-indicator status-active mb-4" />
          <p className="text-xl font-light tracking-widest uppercase">Calculating Thermal Data...</p>
        </div>
      </div>
    );
  }

  // Process data for charts
  const dailyTemps = weatherData.map(d => ({ tMax: d.tMax, tMin: d.tMin }));
  const gddValues = calculateCumulativeGDD(dailyTemps);

  // Historical/Current data for GDD Chart (up to "today")
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIndex = weatherData.findIndex(d => d.date >= todayStr);
  const safeTodayIndex = todayIndex === -1 ? weatherData.length - 1 : todayIndex;

  const chartData = weatherData.slice(0, safeTodayIndex + 1).map((d, i) => ({
    date: d.date.split('-').slice(1).join('/'), // MM/DD
    gdd: gddValues[i]
  }));

  // Forecast data for the grid (next 7 days)
  const forecastData = weatherData.slice(safeTodayIndex + 1).map((d, i) => {
    const cumulativeGDD = gddValues[safeTodayIndex + 1 + i];
    const prediction = predictEmergence(cumulativeGDD, {
      rain: d.rain,
      eveningTemp: d.temp
    });
    return {
      ...d,
      probability: prediction.probability
    };
  });

  const latestGDD = gddValues[safeTodayIndex] || 0;
  const lastDay = weatherData[safeTodayIndex] || {};
  const prediction = predictEmergence(latestGDD, {
    rain: lastDay.rain,
    eveningTemp: lastDay.temp
  });

  return (
    <div className="app-container">
      <header className="mb-12">
        <h1 className="text-5xl">Stag Beetle</h1>
        <p className="text-xl text-muted font-light">Lucanus cervus Emergence Predictor</p>
      </header>

      <div className="dashboard-grid">
        <div className="col-span-4 self-stretch">
          <StatusCard
            gdd={latestGDD}
            probability={prediction.probability}
            status={prediction.status}
            location={location}
          />
        </div>

        <GDDChart data={chartData} />

        <SeasonalityChart data={seasonalityData} />

        {forecastData.length > 0 && <ForecastGrid forecastData={forecastData} />}

        <div className="col-span-8 glass-card">
          <h3 className="text-xl font-bold mb-4">The Science Behind the Prediction</h3>
          <p className="text-muted leading-relaxed">
            Stag beetles spend several years underground as larvae. Their emergence as adults is
            controlled by soil temperature and thermal accumulation. We use a
            <strong> base temperature threshold of 6.6°C</strong> to calculate
            Growing Degree Days (GDD). When the index reaches <strong>620 GDD</strong>,
            the first sightings typically begin. Peak activity is recorded between
            <strong> 810 and 1000 GDD</strong>, often triggered by a warm, dry evening
            following a period of rain.
          </p>
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-muted">
        Quest Brion 2 &copy; 2026 | Data: iNaturalist & Visual Crossing
      </footer>
    </div>
  );
}

export default App;
