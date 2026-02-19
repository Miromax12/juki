import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * Fetch historical and forecast weather data for GDD calculation.
 * @param {string} location - "lat,lon" or city name
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const fetchWeatherData = async (location, startDate, endDate) => {
    if (!WEATHER_API_KEY) {
        console.warn('Weather API Key is missing. Using mock data.');
        return generateMockWeatherData(startDate, endDate);
    }

    try {
        const response = await axios.get(`${BASE_URL}/${location}/${startDate}/${endDate}`, {
            params: {
                unitGroup: 'metric',
                key: WEATHER_API_KEY,
                contentType: 'json',
                include: 'days'
            }
        });

        return response.data.days.map(day => ({
            date: day.datetime,
            tMax: day.tempmax,
            tMin: day.tempmin,
            rain: day.precip > 0,
            temp: day.temp
        }));
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

/**
 * Fallback mock data generator for development.
 */
const generateMockWeatherData = (start, end) => {
    const dates = [];
    let curr = new Date(start);
    const finish = new Date(end);

    while (curr <= finish) {
        dates.push({
            date: curr.toISOString().split('T')[0],
            tMax: 15 + Math.random() * 15,
            tMin: 5 + Math.random() * 10,
            rain: Math.random() > 0.7,
            temp: 12 + Math.random() * 8
        });
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
};
