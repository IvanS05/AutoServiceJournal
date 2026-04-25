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
      searchPlaceholder: 'Fuzzy search by work type…',
      sortBy: 'Sort',
      sort_date: 'Date',
      sort_mileage: 'Mileage',
      sort_workType: 'Work',
      filters: 'Filters',
      active: 'active',
      from: 'From',
      to: 'To',
      clearFilters: 'Clear filters',
      noResults: 'No matching records',
      reminder: 'Remind me',
      chooseTime: 'Choose date & time',
      notifications: 'Notifications',
      enableNotifications: 'Enable notifications',
      notificationsHint: 'Reminders will fire at the set date and time',
      photo: 'Photo',
      addPhoto: 'Add photo',
      changePhoto: 'Change photo',
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
      searchPlaceholder: 'Нечёткий поиск по типу работы…',
      sortBy: 'Сорт.',
      sort_date: 'Дата',
      sort_mileage: 'Пробег',
      sort_workType: 'Тип',
      filters: 'Фильтры',
      active: 'активны',
      from: 'От',
      to: 'До',
      clearFilters: 'Сбросить',
      noResults: 'Ничего не найдено',
      reminder: 'Напоминание',
      chooseTime: 'Выбрать дату и время',
      notifications: 'Уведомления',
      enableNotifications: 'Включить уведомления',
      notificationsHint: 'Напоминание придёт в указанные дату и время',
      photo: 'Фото',
      addPhoto: 'Добавить фото',
      changePhoto: 'Заменить фото',
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