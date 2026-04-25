import { useState, useCallback, useMemo } from 'react';
import { getRecords, deleteRecord } from '../database/database';
import { fuzzyFilter } from '../utils/fuzzySearch';

export const useMainViewModel = () => {
  const [allRecords, setAllRecords] = useState([]);

  // Поиск
  const [searchQuery, setSearchQuery] = useState('');

  // Сортировка
  const [sortField, setSortField] = useState('date');   // 'date' | 'mileage' | 'workType'
  const [sortOrder, setSortOrder] = useState('desc');   // 'asc' | 'desc'

  // Фильтры
  const [filterMileageMin, setFilterMileageMin] = useState('');
  const [filterMileageMax, setFilterMileageMax] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadRecords = useCallback(async () => {
    const data = await getRecords();
    setAllRecords(data);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteRecord(id);
    await loadRecords();
  }, [loadRecords]);

  const toggleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterMileageMin('');
    setFilterMileageMax('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }, []);

  const records = useMemo(() => {
    let result = [...allRecords];

    // 1. Нечёткий поиск по типу работы
    if (searchQuery.trim()) {
      result = fuzzyFilter(result, searchQuery.trim());
    }

    // 2. Фильтр по пробегу
    if (filterMileageMin !== '') {
      result = result.filter(r => Number(r.mileage) >= Number(filterMileageMin));
    }
    if (filterMileageMax !== '') {
      result = result.filter(r => Number(r.mileage) <= Number(filterMileageMax));
    }

    // 3. Фильтр по дате (ISO строки сравниваются лексикографически)
    if (filterDateFrom) {
      result = result.filter(r => r.date >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter(r => r.date <= filterDateTo);
    }

    // 4. Сортировка (не применяется, если активен нечёткий поиск — там своя очерёдность по score)
    if (!searchQuery.trim()) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'mileage') {
          valA = Number(valA);
          valB = Number(valB);
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    allRecords,
    searchQuery,
    sortField,
    sortOrder,
    filterMileageMin,
    filterMileageMax,
    filterDateFrom,
    filterDateTo,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterMileageMin !== '' ||
    filterMileageMax !== '' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  return {
    records,
    loadRecords,
    handleDelete,
    // поиск
    searchQuery,
    setSearchQuery,
    // сортировка
    sortField,
    sortOrder,
    toggleSort,
    // фильтры
    filterMileageMin,
    setFilterMileageMin,
    filterMileageMax,
    setFilterMileageMax,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    // утилиты
    clearFilters,
    hasActiveFilters,
    totalCount: allRecords.length,
  };
};
