import axios from 'axios';

const INAT_BASE_URL = 'https://api.inaturalist.org/v1';
const LUCANUS_CERVUS_TAXON_ID = 47258;

/**
 * Fetch historical observations for Stag Beetle.
 */
export const fetchObservations = async (params = {}) => {
    try {
        const response = await axios.get(`${INAT_BASE_URL}/observations`, {
            params: {
                taxon_id: LUCANUS_CERVUS_TAXON_ID,
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
export const fetchSeasonality = async (placeId = null) => {
    try {
        const response = await axios.get(`${INAT_BASE_URL}/observations/histogram`, {
            params: {
                taxon_id: LUCANUS_CERVUS_TAXON_ID,
                date_field: 'observed',
                interval: 'month',
                place_id: placeId
            }
        });
        return response.data.results.month;
    } catch (error) {
        console.error('Error fetching seasonality data:', error);
        throw error;
    }
};
