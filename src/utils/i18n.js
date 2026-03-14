import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = { // словари
  en: {
    translation: {
      serviceJournal: 'Service Journal',
      noRecords: 'No records yet',
      addRecord: 'Add Record',
      editRecord: 'Edit Record',
      workType: 'Work Type',
      mileage: 'Mileage',
      date: 'Date',
      save: 'Save',
      delete: 'Delete',
      cancel: 'Cancel',
      deleteTitle: 'Delete Record',
      deleteConfirm: 'Are you sure?',
      vinLookup: 'VIN Lookup',
      enterVin: 'Enter VIN',
      showAllFields: 'Show all fields',
      showFiltered: 'Show filtered',
      settings: 'Settings',
      appearance: 'Appearance',
      darkTheme: 'Dark Theme',
      language: 'Language',
      enterWorkType: 'Enter work type',
      error: 'Error',
      fillAllFields: 'Please fill all fields',
      mileageMustBeNumber: 'Mileage must be a number',
    },
  },
  ru: {
    translation: {
      serviceJournal: 'Журнал ТО',
      noRecords: 'Нет записей',
      addRecord: 'Добавить запись',
      editRecord: 'Редактировать',
      workType: 'Тип работы',
      mileage: 'Пробег',
      date: 'Дата',
      save: 'Сохранить',
      delete: 'Удалить',
      cancel: 'Отмена',
      deleteTitle: 'Удаление',
      deleteConfirm: 'Вы уверены?',
      vinLookup: 'Поиск по VIN',
      enterVin: 'Введите VIN',
      showAllFields: 'Показать все поля',
      showFiltered: 'Показать важные',
      settings: 'Настройки',
      appearance: 'Внешний вид',
      darkTheme: 'Тёмная тема',
      language: 'Язык',
      enterWorkType: 'Введите тип работы',
      error: 'Ошибка',
      fillAllFields: 'Заполните все поля',
      mileageMustBeNumber: 'Пробег должен быть числом',
    },
  },
};

// Функция для загрузки сохраненного языка
const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage) {
      return savedLanguage;
    }
  } catch (error) {
    console.log('Error loading language:', error);
  }
  
  // Если нет сохраненного, берем язык системы
  const locales = RNLocalize.getLocales();
  if (locales.length > 0 && locales[0].languageCode === 'ru') {
    return 'ru';
  }
  return 'en';
};

// Функция для сохранения языка
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem('language', language);
  } catch (error) {
    console.log('Error saving language:', error);
  }
};

// Инициализация i18n
loadLanguage().then((language) => {
  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
});

export default i18n;