import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme(); // Вызывается 1 раз при запуске
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved !== null) setIsDarkMode(saved === 'dark'); // 'dark' → saved === 'dark' → true/ 'light' → saved === 'dark' → false
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme); // // 2. Меняем состояние (сразу видно на экране)
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = {
    isDarkMode,
    backgroundColor: isDarkMode ? colors.dark.background : colors.light.background,
    textColor: isDarkMode ? colors.dark.text : colors.light.text,
    primaryColor: isDarkMode ? colors.dark.primary : colors.light.primary,
    secondaryColor: isDarkMode ? colors.dark.secondary : colors.light.secondary,
    cardColor: isDarkMode ? colors.dark.card : colors.light.card,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);