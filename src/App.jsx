import { useState, useEffect } from 'react';
import { fetchSeasonality } from './services/inaturalist';
import { fetchWeatherData } from './services/weather';
import { calculateCumulativeGDD, predictEmergence, SPECIES_CONFIG } from './logic/gddCalculator';
import StatusCard from './components/StatusCard';
import GDDChart from './components/GDDChart';
import SeasonalityChart from './components/SeasonalityChart';
import ForecastGrid from './components/ForecastGrid';
import './styles/index.css';

// Localization Dictionary
const I18N = {
  ru: {
    title: 'Прогноз вылета насекомых',
    subtitle: 'На основе индекса накопленного тепла (GDD)',
    selectSpecies: 'Выберите вид',
    selectLocation: 'Ваш регион',
    calculating: 'Расчет тепловых данных...',
    scienceTitle: 'Наука за прогнозом',
    scienceDesc: (species) => `Жуки проводят несколько лет под землей в виде личинок. Их выход во взрослом состоянии контролируется температурой почвы и накопленным теплом. Мы используем базовый порог температуры **${species.tBase}°C** для расчета суммы эффективных температур (GDD). Когда индекс достигает **${species.thresholdStart} GDD**, начинаются первые встречи. Пик активности наступает между **${species.thresholdStart} и ${species.thresholdPeak} GDD**, часто после дождей в теплые вечера.`,
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

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // 1. Fetch historical seasonality for specific taxon
        const seasonality = await fetchSeasonality(currentSpecies.taxonId);
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
  }, [location, speciesKey, currentSpecies.taxonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d] text-white">
        <div className="text-center">
          <div className="status-indicator status-active mb-4" />
          <p className="text-xl font-light tracking-widest uppercase">{lang.calculating}</p>
        </div>
      </div>
    );
  }

  // Process data
  const dailyTemps = weatherData.map(d => ({ tMax: d.tMax, tMin: d.tMin }));
  const gddValues = calculateCumulativeGDD(dailyTemps, currentSpecies.tBase);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIndex = weatherData.findIndex(d => d.date >= todayStr);
  const safeTodayIndex = todayIndex === -1 ? weatherData.length - 1 : todayIndex;

  const chartData = weatherData.slice(0, safeTodayIndex + 1).map((d, i) => ({
    date: d.date.split('-').slice(1).join('/'),
    gdd: gddValues[i]
  }));

  const forecastData = weatherData.slice(safeTodayIndex + 1).map((d, i) => {
    const cumulativeGDD = gddValues[safeTodayIndex + 1 + i];
    const prediction = predictEmergence(cumulativeGDD, speciesKey, {
      rain: d.rain,
      eveningTemp: d.temp
    });
    return { ...d, probability: prediction.probability };
  });

  const latestGDD = gddValues[safeTodayIndex] || 0;
  const lastDay = weatherData[safeTodayIndex] || {};
  const prediction = predictEmergence(latestGDD, speciesKey, {
    rain: lastDay.rain,
    eveningTemp: lastDay.temp
  });

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    setLocation(locationInput);
  };

  return (
    <div className="app-container">
      <header className="mb-12">
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-5xl">{currentSpecies.name}</h1>
            <p className="text-xl text-muted font-light">{currentSpecies.scientificName} | {lang.subtitle}</p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="glass-card !p-4 !rounded-xl">
              <label className="text-xs text-muted block mb-2 uppercase">{lang.selectSpecies}</label>
              <select
                value={speciesKey}
                onChange={(e) => setSpeciesKey(e.target.value)}
                className="bg-transparent text-white border-none outline-none font-semibold cursor-pointer"
              >
                {Object.keys(SPECIES_CONFIG).map(key => (
                  <option key={key} value={key} className="bg-bg-dark">{SPECIES_CONFIG[key].name}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleLocationSubmit} className="glass-card !p-4 !rounded-xl relative">
              <label className="text-xs text-muted block mb-2 uppercase">{lang.selectLocation}</label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Город или регион..."
                className="font-semibold w-56"
              />
              <span className="absolute bottom-1 right-4 text-[9px] text-muted opacity-50 uppercase">Enter ⏎</span>
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
          />
        </div>

        <GDDChart data={chartData} config={currentSpecies} />

        <SeasonalityChart data={seasonalityData} />

        {forecastData.length > 0 && <ForecastGrid forecastData={forecastData} />}

        <div className="col-span-8 glass-card">
          <h3 className="text-xl font-bold mb-4">{lang.scienceTitle}</h3>
          <p className="text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: lang.scienceDesc(currentSpecies) }} />
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-muted">
        {lang.footer(new Date().getFullYear())}
      </footer>
    </div>
  );
}

export default App;
