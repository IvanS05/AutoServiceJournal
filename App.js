import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/utils/theme';
import { initDatabase, insertSampleData } from './src/database/database';
import './src/utils/i18n';
import { LogBox } from 'react-native';

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        await insertSampleData();
      } catch (error) {
        console.error('Database setup error:', error);
      }
    };
    
    setupDatabase();
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