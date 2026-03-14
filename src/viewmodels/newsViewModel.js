import { useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { fetchVehicleByVin } from '../services/nhtsaApi';
import { getCache, setCache } from '../database/database';

// This hook replaces the previous news viewmodel and provides VIN lookup logic.
export const useNewsViewModel = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = useCallback(async (vin) => {
    if (!vin || vin.trim() === '') {
      setError('VIN required');
      setVehicle(null);
      return; // если плохой ввод дальше не идем
    }
    setLoading(true); // Включаем крутилку загрузки
    setError(null);
    const cacheKey = `vin_${vin}`; //'vin_1C4BJWFGXDL531773'
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const data = await fetchVehicleByVin(vin);
        setVehicle(data);
        await setCache(cacheKey, JSON.stringify(data));
      } else {
        const cached = await getCache(cacheKey);
        if (cached) {
          setVehicle(JSON.parse(cached));
        } else {
          setError('No internet and no cached data');
        }
      }
    } catch (e) {
      setError(e.message);
      const cached = await getCache(cacheKey);
      if (cached) setVehicle(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, []);

  return { vehicle, loading, error, lookup };
};
