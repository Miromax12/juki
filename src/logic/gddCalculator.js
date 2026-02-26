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
 * Calculates the average GDD per day over the last `windowDays` days.
 * Useful for projecting when a threshold will be reached.
 */
export const calculateGDDRate = (gddValues, windowDays = 14) => {
  if (gddValues.length < 2) return 0;
  const len = gddValues.length;
  const startIdx = Math.max(0, len - windowDays - 1);
  const delta = gddValues[len - 1] - gddValues[startIdx];
  const days = len - 1 - startIdx;
  return days > 0 ? delta / days : 0;
};

/**
 * Predicts the calendar date when a GDD threshold will be reached.
 * Returns null if the threshold is already met or the rate is zero.
 */
export const predictThresholdDate = (currentGDD, targetGDD, gddPerDay, todayStr) => {
  if (currentGDD >= targetGDD) return { date: null, daysLeft: 0 };
  if (gddPerDay <= 0) return { date: null, daysLeft: null };
  const daysLeft = Math.ceil((targetGDD - currentGDD) / gddPerDay);
  const targetDate = new Date(todayStr);
  targetDate.setDate(targetDate.getDate() + daysLeft);
  return {
    date: targetDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
    daysLeft
  };
};

/**
 * Calculates how many GDD units are still needed to reach each threshold.
 */
export const calculateGDDDeficit = (currentGDD, speciesKey) => {
  const config = SPECIES_CONFIG[speciesKey];
  return {
    toEmergence: Math.max(0, config.thresholdStart - currentGDD),
    toPeak: Math.max(0, config.thresholdPeak - currentGDD)
  };
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
