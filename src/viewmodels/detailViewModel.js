import { useState, useCallback } from 'react';
import { addRecord, updateRecord } from '../database/database';

export const useDetailViewModel = (initialRecord) => {
  const [workType, setWorkType] = useState(initialRecord?.workType || '');
  const [mileage, setMileage] = useState(initialRecord?.mileage?.toString() || '');
  const [date, setDate] = useState(initialRecord?.date || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async () => {
    setError(null);
    if (!workType.trim() || !mileage.trim() || !date.trim()) {
      setError('fillAllFields');
      return false;
    }
    const mileageNum = parseInt(mileage);
    if (isNaN(mileageNum)) {
      setError('mileageMustBeNumber');
      return false;
    }

    const recordData = {
      workType: workType.trim(),
      mileage: mileageNum,
      date: date.trim(),
    };

    setLoading(true);
    try {
      if (initialRecord) {
        await updateRecord({ ...recordData, id: initialRecord.id });
      } else {
        await addRecord(recordData);
      }
      return true;
    } catch (e) {
      setError(e.message || 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [workType, mileage, date, initialRecord]);

  return {
    workType,
    setWorkType,
    mileage,
    setMileage,
    date,
    setDate,
    loading,
    error,
    save,
  };
};
