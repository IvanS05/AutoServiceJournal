import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'autoservice_reminders';
const NOTIF_ENABLED_KEY = 'notifications_enabled';

// Создаём Android-канал (безопасно вызывать повторно)
export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Service Reminders',
    importance: AndroidImportance.HIGH,
  });
};

// Запрос разрешения (Android 13+ и iOS)
export const requestNotificationPermission = async () => {
  const settings = await notifee.requestPermission();
  return settings;
};

// Проверка: включены ли уведомления глобально
export const areNotificationsEnabled = async () => {
  const val = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
  return val !== 'false'; // по умолчанию включены
};

export const setNotificationsEnabled = async (enabled) => {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(enabled));
};

// Запланировать напоминание для записи
export const scheduleReminder = async (record) => {
  if (!record.reminder_time) return;

  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const timestamp = new Date(record.reminder_time).getTime();
  if (isNaN(timestamp) || timestamp <= Date.now()) return;

  // Сначала отменяем предыдущее (если было)
  await cancelReminder(record.id);

  await notifee.createTriggerNotification(
    {
      id: String(record.id),
      title: 'AutoService Journal',
      body: record.workType,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp,
    }
  );
};

// Отменить напоминание
export const cancelReminder = async (recordId) => {
  try {
    await notifee.cancelNotification(String(recordId));
  } catch (_) {}
};

// При старте приложения перепланировать все будущие напоминания
export const rescheduleAll = async (records) => {
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  const now = Date.now();
  for (const record of records) {
    if (!record.reminder_time) continue;
    const ts = new Date(record.reminder_time).getTime();
    if (!isNaN(ts) && ts > now) {
      await scheduleReminder(record);
    }
  }
};

// Отменить все запланированные напоминания (используется при глобальном отключении)
export const cancelAllReminders = async () => {
  await notifee.cancelAllNotifications();
};
