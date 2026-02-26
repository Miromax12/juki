import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchSeasonality } from './services/inaturalist';
import { fetchWeatherData } from './services/weather';
import { calculateCumulativeGDD, predictEmergence, SPECIES_CONFIG } from './logic/gddCalculator';
import StatusCard from './components/StatusCard';
import GDDChart from './components/GDDChart';
import SeasonalityChart from './components/SeasonalityChart';
import ForecastGrid from './components/ForecastGrid';
import './styles/index.css';

const I18N = {
  ru: {
    title: 'Прогноз вылета насекомых',
    subtitle: 'На основе индекса накопленного тепла (GDD)',
    selectSpecies: 'Выберите вид',
    selectLocation: 'Ваш регион',
    calculating: 'Расчет тепловых данных...',
    scienceTitle: 'Наука за прогнозом',
    footer: (year) => `Quest Brion 2 © ${year} | Данные: iNaturalist & Visual Crossing`
  }
};

function App() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState([]);
  const [seasonalityData, setSeasonalityData] = useState({});
  const [speciesKey, setSpeciesKey] = useState('stag_beetle');
  const [location, setLocation] = useState('Киев, Украина');
  const [locationInput, setLocationInput] = useState(location);

  const currentSpecies = SPECIES_CONFIG[speciesKey];
  const lang = I18N.ru;

  // All hooks must be called before any early return
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const gddValues = useMemo(
    () => calculateCumulativeGDD(weatherData.map(d => ({ tMax: d.tMax, tMin: d.tMin })), currentSpecies.tBase),
    [weatherData, currentSpecies.tBase]
  );

  const safeTodayIndex = useMemo(() => {
    if (!weatherData.length) return 0;
    const idx = weatherData.findIndex(d => d.date >= todayStr);
    return idx === -1 ? weatherData.length - 1 : idx;
  }, [weatherData, todayStr]);

  const chartData = useMemo(
    () => weatherData.slice(0, safeTodayIndex + 1).map((d, i) => ({
      date: d.date.split('-').slice(1).join('/'),
      gdd: gddValues[i]
    })),
    [weatherData, safeTodayIndex, gddValues]
  );

  const forecastData = useMemo(
    () => weatherData.slice(safeTodayIndex + 1).map((d, i) => {
      const cumulativeGDD = gddValues[safeTodayIndex + 1 + i];
      const pred = predictEmergence(cumulativeGDD, speciesKey, { rain: d.rain, eveningTemp: d.temp });
      return { ...d, probability: pred.probability };
    }),
    [weatherData, safeTodayIndex, gddValues, speciesKey]
  );

  const lastDay = useMemo(() => weatherData[safeTodayIndex] || {}, [weatherData, safeTodayIndex]);
  const latestGDD = gddValues[safeTodayIndex] || 0;

  const prediction = useMemo(
    () => predictEmergence(latestGDD, speciesKey, { rain: lastDay.rain, eveningTemp: lastDay.temp }),
    [latestGDD, speciesKey, lastDay]
  );

  const handleLocationSubmit = useCallback((e) => {
    e.preventDefault();
    setLocation(locationInput);
  }, [locationInput]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const seasonality = await fetchSeasonality(currentSpecies.taxonId);
        setSeasonalityData(seasonality);

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
  }, [location, speciesKey, currentSpecies.taxonId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-ring">
            <div /><div /><div /><div />
          </div>
          <p className="loading-text">{lang.calculating}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="mb-12">
        <div className="header-layout">
          <div>
            <h1>{currentSpecies.name}</h1>
            <p className="header-subtitle">{currentSpecies.scientificName} | {lang.subtitle}</p>
          </div>

          <div className="controls-row">
            <div className="glass-card control-card">
              <label className="control-label">{lang.selectSpecies}</label>
              <select
                value={speciesKey}
                onChange={(e) => setSpeciesKey(e.target.value)}
              >
                {Object.keys(SPECIES_CONFIG).map(key => (
                  <option key={key} value={key}>{SPECIES_CONFIG[key].name}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleLocationSubmit} className="glass-card control-card location-form">
              <label className="control-label">{lang.selectLocation}</label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Город или регион..."
              />
              <span className="enter-hint">Enter ⏎</span>
            </form>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="col-span-4 self-stretch">
          <StatusCard
            gdd={latestGDD}
            probability={prediction.probability}
            status={prediction.status}
            location={location}
            species={currentSpecies}
          />
        </div>

        <GDDChart data={chartData} config={currentSpecies} />
        <SeasonalityChart data={seasonalityData} />

        {forecastData.length > 0 && <ForecastGrid forecastData={forecastData} />}

        <div className="col-span-8 glass-card">
          <h3 className="text-xl font-bold mb-4">{lang.scienceTitle}</h3>
          <p className="text-muted science-text">
            Жуки проводят несколько лет под землей в виде личинок. Их выход во взрослом состоянии
            контролируется температурой почвы и накопленным теплом.{' '}
            Мы используем базовый порог температуры{' '}
            <strong className="science-highlight">{currentSpecies.tBase}°C</strong>{' '}
            для расчета суммы эффективных температур (GDD). Когда индекс достигает{' '}
            <strong className="science-highlight">{currentSpecies.thresholdStart} GDD</strong>,
            начинаются первые встречи. Пик активности наступает между{' '}
            <strong className="science-highlight">{currentSpecies.thresholdStart}</strong> и{' '}
            <strong className="science-highlight">{currentSpecies.thresholdPeak} GDD</strong>,
            часто после дождей в теплые вечера.
          </p>
        </div>
      </div>

      <footer className="app-footer">
        {lang.footer(new Date().getFullYear())}
      </footer>
    </div>
  );
}

export default App;
