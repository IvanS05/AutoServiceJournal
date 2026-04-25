import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/utils/theme';
import { initDatabase, getRecords } from './src/database/database';
import './src/utils/i18n';
import { LogBox } from 'react-native';
import {
  createNotificationChannel,
  requestNotificationPermission,
  rescheduleAll,
  areNotificationsEnabled,
} from './src/services/notificationService';

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase(); // health-check бэкенда

        // Настройка уведомлений
        await createNotificationChannel();
        const enabled = await areNotificationsEnabled();
        if (enabled) {
          await requestNotificationPermission();
          const records = await getRecords();
          await rescheduleAll(records);
        }
      } catch (error) {
        console.error('Setup error:', error);
      }
    };

    setup();
  }, []);
  useEffect(() => {
    LogBox.ignoreAllLogs(true); // Игнорировать все предупреждения
  }, []);
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.backgroundColor}
      />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;