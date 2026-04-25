/**
 * database.js — слой данных.
 *
 * Записи хранятся в MySQL через REST API бэкенда.
 * Фото передаётся как base64 в JSON — надёжнее FormData на Android.
 * VIN-кэш хранится в AsyncStorage.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../constants/apiConfig';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,            // 30 с — base64 может быть крупным
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// ─── Records ─────────────────────────────────────────────────────────────────

export const initDatabase = async () => {
  try {
    await api.get('/health');
    console.log('Backend connected');
  } catch (e) {
    console.warn('Backend unavailable:', e.message);
  }
};

export const insertSampleData = async () => {};

export const getRecords = async () => {
  try {
    const { data } = await api.get('/records');
    return (data || []).map(normalizeRecord);
  } catch (e) {
    console.error('getRecords error:', e.message);
    return [];
  }
};

export const getRecordById = async (id) => {
  try {
    const { data } = await api.get(`/records/${id}`);
    return data ? normalizeRecord(data) : null;
  } catch (e) {
    console.error('getRecordById error:', e.message);
    return null;
  }
};

/**
 * Добавить запись.
 * @param {object} record    - { workType, mileage, date, reminder_time }
 * @param {object} [imageFile] - asset из react-native-image-picker (с base64)
 */
export const addRecord = async (record, imageFile = null) => {
  const { data } = await api.post('/records', {
    workType:      record.workType,
    mileage:       Number(record.mileage),
    date:          record.date,
    reminder_time: record.reminder_time || null,
    ...buildImagePayload(imageFile),
  });
  return normalizeRecord(data);
};

/**
 * Обновить запись.
 * @param {object}  record        - { id, workType, mileage, date, reminder_time }
 * @param {object}  [imageFile]   - новый файл (если null — зависит от imageCleared)
 * @param {boolean} [imageCleared]- true = пользователь явно удалил фото
 */
export const updateRecord = async (record, imageFile = null, imageCleared = false) => {
  const { data } = await api.put(`/records/${record.id}`, {
    workType:      record.workType,
    mileage:       Number(record.mileage),
    date:          record.date,
    reminder_time: record.reminder_time || null,
    // keep_image=false если: загружен новый файл ИЛИ пользователь явно удалил
    keep_image:    !imageFile && !imageCleared,
    ...buildImagePayload(imageFile),
  });
  return normalizeRecord(data);
};

export const deleteRecord = async (id) => {
  try {
    await api.delete(`/records/${id}`);
  } catch (e) {
    console.error('deleteRecord error:', e.message);
  }
};

// ─── VIN Cache (AsyncStorage) ────────────────────────────────────────────────

export const getCache = async (key) => {
  try {
    return await AsyncStorage.getItem(`cache_${key}`);
  } catch {
    return null;
  }
};

export const setCache = async (key, value) => {
  try {
    await AsyncStorage.setItem(`cache_${key}`, value);
  } catch { /* ignore */ }
};

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Строит поля для передачи фото через JSON (base64).
 * Это надёжнее FormData/multipart на Android (нет зависимости от content:// URI).
 */
function buildImagePayload(imageFile) {
  if (!imageFile?.base64) return {};
  return {
    imageBase64: imageFile.base64,
    imageMime:   imageFile.type     || 'image/jpeg',
    imageName:   imageFile.fileName || `photo_${Date.now()}.jpg`,
  };
}

function normalizeRecord(record) {
  return {
    ...record,
    date: normalizeDate(record?.date),
  };
}

function normalizeDate(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
