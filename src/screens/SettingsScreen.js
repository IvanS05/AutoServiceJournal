import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../utils/i18n'; // Добавь этот импорт

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang); // Сохраняем язык
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: theme.secondaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {t('settings')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          {t('appearance')}
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: theme.cardColor }]}>
          <Text style={[styles.settingText, { color: theme.textColor }]}>
            {t('darkTheme')}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#2ecc71' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          {t('language')}
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: theme.cardColor },
            currentLanguage === 'ru' && styles.activeItem,
          ]}
          onPress={() => changeLanguage('ru')}>
          <Text style={[styles.settingText, { color: theme.textColor }]}>
            Русский
          </Text>
          {currentLanguage === 'ru' && (
            <Icon name="check" size={24} color={theme.primaryColor} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: theme.cardColor },
            currentLanguage === 'en' && styles.activeItem,
          ]}
          onPress={() => changeLanguage('en')}>
          <Text style={[styles.settingText, { color: theme.textColor }]}>
            English
          </Text>
          {currentLanguage === 'en' && (
            <Icon name="check" size={24} color={theme.primaryColor} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: { fontSize: 16 },
  activeItem: { borderWidth: 2, borderColor: '#2ecc71' },
});

export default SettingsScreen;