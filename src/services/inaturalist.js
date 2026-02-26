import axios from 'axios';

const INAT_BASE_URL = 'https://api.inaturalist.org/v1';

/**
 * Fetch historical observations for a specific species.
 */
export const fetchObservations = async (taxonId, params = {}) => {
    try {
        const response = await axios.get(`${INAT_BASE_URL}/observations`, {
            params: {
                taxon_id: taxonId,
                quality_grade: 'research',
                per_page: 200,
                ...params
            }
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching iNaturalist data:', error);
        throw error;
    }
};

/**
 * Get monthly histogram of observations to show seasonality.
 */
export const fetchSeasonality = async (taxonId, placeId = null) => {
    try {
        const response = await axios.get(`${INAT_BASE_URL}/observations/histogram`, {
            params: {
                taxon_id: taxonId,
                date_field: 'observed',
                interval: 'month_of_year',
                place_id: placeId
            }
        });
        return response.data.results.month_of_year;
    } catch (error) {
        console.error('Error fetching seasonality data:', error);
        throw error;
    }
};
