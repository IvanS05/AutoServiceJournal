import { useState, useCallback } from 'react';
import { addRecord, updateRecord } from '../database/database';
import { scheduleReminder, cancelReminder } from '../services/notificationService';

export const useDetailViewModel = (initialRecord) => {
  const [workType,     setWorkType]     = useState(initialRecord?.workType      || '');
  const [mileage,      setMileage]      = useState(initialRecord?.mileage?.toString() || '');
  const [date,         setDate]         = useState(initialRecord?.date          || '');
  const [reminderTime, setReminderTime] = useState(initialRecord?.reminder_time || null);

  // Изображение: localImageUri — для отображения, imageFile — для загрузки
  const [localImageUri, setLocalImageUri] = useState(initialRecord?.image_url || null);
  const [imageFile,     setImageFile]     = useState(null);    // новый файл из picker
  const [imageCleared,  setImageCleared]  = useState(false);   // true = пользователь явно удалил фото

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const clearImage = useCallback(() => {
    setLocalImageUri(null);
    setImageFile(null);
    setImageCleared(true);   // явное удаление
  }, []);

  const pickImage = useCallback((asset) => {
    setLocalImageUri(asset.uri);
    setImageFile(asset);
    setImageCleared(false);  // новое фото снимает флаг удаления
  }, []);

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
      workType:     workType.trim(),
      mileage:      mileageNum,
      date:         date.trim(),
      reminder_time: reminderTime || null,
    };

    setLoading(true);
    try {
      if (initialRecord) {
        await updateRecord({ ...recordData, id: initialRecord.id, image_url: localImageUri }, imageFile, imageCleared);
        if (reminderTime) {
          await scheduleReminder({ ...recordData, id: initialRecord.id });
        } else {
          await cancelReminder(initialRecord.id);
        }
      } else {
        const saved = await addRecord(recordData, imageFile);
        if (saved?.id && reminderTime) {
          await scheduleReminder({ ...recordData, id: saved.id });
        }
      }
      return { success: true };
    } catch (e) {
      // Вытаскиваем сообщение из ответа бэкенда или из axios
      const msg = e.response?.data?.error || e.message || 'error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [workType, mileage, date, reminderTime, localImageUri, imageFile, imageCleared, initialRecord]);

  return {
    workType,     setWorkType,
    mileage,      setMileage,
    date,         setDate,
    reminderTime, setReminderTime,
    localImageUri,
    imageFile,
    pickImage,
    clearImage,
    loading,
    error,
    save,
  };
};
