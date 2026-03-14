import axios from 'axios';
import { NHTSA_API_URL, RANDOM_CAR_API } from '../constants/apiConfig';

// Decode VIN using NHTSA VPIC (axios with improved error handling)
// On network error, attempt a lightweight fallback to RANDOM_CAR_API for demo.
export const fetchVehicleByVin = async (vin) => {
  const safeVin = encodeURIComponent(vin || '');
  const url = `${NHTSA_API_URL}/DecodeVin/${safeVin}?format=json`;
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch (err) {
    // Detailed logging
    console.error('fetchVehicleByVin primary error:', { url, error: err });

    // Try a fallback public vehicle API to keep the app usable in emulator
    try {
      const fbRes = await axios.get(RANDOM_CAR_API, { timeout: 8000 });
      const obj = fbRes.data || {};
      // Convert fallback object into VPIC-like Results array of { Variable, Value }
      const results = Object.keys(obj).map((k) => ({ Variable: k, Value: obj[k] }));
      return {
        Count: results.length,
        Message: 'Fallback data from RANDOM_CAR_API due to primary request error',
        SearchCriteria: `VIN: ${vin}`,
        Results: results,
      };
    } catch (fbErr) {
      console.error('fetchVehicleByVin fallback error:', fbErr);
      let msg = 'Network request failed';
      if (err.response) {
        msg = `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        msg = `No response received (request made). ${err.message}`;
      } else {
        msg = err.message;
      }
      throw new Error(msg);
    }
  }
};
