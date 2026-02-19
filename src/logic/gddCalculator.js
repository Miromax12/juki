/**
 * Logic for calculating Growing Degree Days (GDD)
 * and emergence prediction for Lucanus cervus.
 */

export const CONFIG = {
  TBASE: 6.6,
  THRESHOLD_START: 620,
  THRESHOLD_PEAK: 810,
  OPTIMAL_TEMP: 24, // Preferred flight temp
};

/**
 * Calculates GDD for a single day.
 * @param {number} tMax 
 * @param {number} tMin 
 * @returns {number}
 */
export const calculateDailyGDD = (tMax, tMin) => {
  const tAvg = (tMax + tMin) / 2;
  return Math.max(0, tAvg - CONFIG.TBASE);
};

/**
 * Calculates cumulative GDD from an array of daily temps.
 * @param {Array<{tMax: number, tMin: number}>} dailyData 
 * @returns {Array<number>}
 */
export const calculateCumulativeGDD = (dailyData) => {
  let cumulative = 0;
  return dailyData.map(day => {
    cumulative += calculateDailyGDD(day.tMax, day.tMin);
    return Number(cumulative.toFixed(2));
  });
};

/**
 * Predicts emergence probability based on GDD and weather triggers.
 * @param {number} gdd 
 * @param {object} triggers { rainLast3Days: boolean, tempEvening: number }
 * @returns {object} { probability: number, status: string }
 */
export const predictEmergence = (gdd, triggers = {}) => {
  let probability = 0;
  let status = "Not active";

  if (gdd < CONFIG.THRESHOLD_START * 0.8) {
    status = "Too early. Development in progress.";
    probability = 5;
  } else if (gdd < CONFIG.THRESHOLD_START) {
    status = "Getting ready. Emergence expected in 1-2 weeks.";
    probability = 20;
  } else if (gdd >= CONFIG.THRESHOLD_START && gdd < CONFIG.THRESHOLD_PEAK) {
    status = "Active! Emergence has started.";
    probability = 60;
    if (triggers.eveningTemp > 20) probability += 20;
    if (!triggers.rain) probability += 10;
  } else if (gdd >= CONFIG.THRESHOLD_PEAK && gdd < CONFIG.THRESHOLD_PEAK + 200) {
    status = "Peak Season! High activity expected.";
    probability = 95;
  } else {
    status = "Season winding down.";
    probability = 30;
  }

  return { probability: Math.min(100, probability), status };
};
