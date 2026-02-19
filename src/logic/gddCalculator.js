/**
 * Logic for calculating Growing Degree Days (GDD)
 * and emergence prediction for multiple insect species.
 */

export const SPECIES_CONFIG = {
  stag_beetle: {
    name: 'Жук-олень',
    scientificName: 'Lucanus cervus',
    taxonId: 47258,
    tBase: 6.6,
    thresholdStart: 620,
    thresholdPeak: 810,
    optimalTemp: 24
  },
  ground_beetle: {
    name: 'Жужелица',
    scientificName: 'Carabus',
    taxonId: 49051,
    tBase: 5.0,
    thresholdStart: 250,
    thresholdPeak: 400,
    optimalTemp: 20
  }
};

/**
 * Calculates GDD for a single day.
 */
export const calculateDailyGDD = (tMax, tMin, tBase) => {
  const tAvg = (tMax + tMin) / 2;
  return Math.max(0, tAvg - tBase);
};

/**
 * Calculates cumulative GDD from an array of daily temps.
 */
export const calculateCumulativeGDD = (dailyData, tBase) => {
  let cumulative = 0;
  return dailyData.map(day => {
    cumulative += calculateDailyGDD(day.tMax, day.tMin, tBase);
    return Number(cumulative.toFixed(2));
  });
};

/**
 * Predicts emergence probability based on GDD and weather triggers.
 */
export const predictEmergence = (gdd, speciesKey, triggers = {}) => {
  const config = SPECIES_CONFIG[speciesKey];
  let probability = 0;
  let status = "";

  if (gdd < config.thresholdStart * 0.8) {
    status = "Слишком рано. Развитие личинок продолжается.";
    probability = 5;
  } else if (gdd < config.thresholdStart) {
    status = "Подготовка. Вылет ожидается через 1-2 недели.";
    probability = 20;
  } else if (gdd >= config.thresholdStart && gdd < config.thresholdPeak) {
    status = "Активность! Начало вылета.";
    probability = 60;
    if (triggers.eveningTemp > 20) probability += 20;
    if (!triggers.rain) probability += 10;
  } else if (gdd >= config.thresholdPeak && gdd < config.thresholdPeak + 200) {
    status = "Пик сезона! Высокая вероятность встречи.";
    probability = 95;
  } else {
    status = "Сезон подходит к концу.";
    probability = 30;
  }

  return { probability: Math.min(100, probability), status, config };
};
