import { useState, useCallback } from 'react';
import { getRecords, deleteRecord } from '../database/database';

export const useMainViewModel = () => {
  const [records, setRecords] = useState([]);

  const loadRecords = useCallback(async () => {
    const data = await getRecords();
    setRecords(data);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteRecord(id);
    await loadRecords();
  }, [loadRecords]);

  return { records, loadRecords, handleDelete, setRecords };
};
