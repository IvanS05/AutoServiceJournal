import React, { useState, useEffect } from 'react';
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
import { saveLanguage } from '../utils/i18n';
import {
  areNotificationsEnabled,
  setNotificationsEnabled,
  cancelAllReminders,
  requestNotificationPermission,
} from '../services/notificationService';
import { getRecords } from '../database/database';
import { rescheduleAll } from '../services/notificationService';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    areNotificationsEnabled().then(setNotifEnabled);
  }, []);

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
  };

  const handleNotifToggle = async (value) => {
    setNotifEnabled(value);
    await setNotificationsEnabled(value);

    if (!value) {
      await cancelAllReminders();
    } else {
      await requestNotificationPermission();
      const records = await getRecords();
      await rescheduleAll(records);
    }
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

      {/* Appearance */}
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

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          {t('notifications')}
        </Text>
        <View style={[styles.settingItem, { backgroundColor: theme.cardColor }]}>
          <View style={styles.settingLeft}>
            <Icon name="notifications" size={20} color={notifEnabled ? theme.primaryColor : theme.secondaryColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingText, { color: theme.textColor }]}>
              {t('enableNotifications')}
            </Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={handleNotifToggle}
            trackColor={{ false: '#767577', true: theme.primaryColor + '80' }}
            thumbColor={notifEnabled ? theme.primaryColor : '#f4f3f4'}
          />
        </View>
        <Text style={[styles.hint, { color: theme.secondaryColor }]}>
          {t('notificationsHint')}
        </Text>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          {t('language')}
        </Text>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.cardColor }, currentLanguage === 'ru' && styles.activeItem]}
          onPress={() => changeLanguage('ru')}>
          <Text style={[styles.settingText, { color: theme.textColor }]}>Русский</Text>
          {currentLanguage === 'ru' && (
            <Icon name="check" size={24} color={theme.primaryColor} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.cardColor }, currentLanguage === 'en' && styles.activeItem]}
          onPress={() => changeLanguage('en')}>
          <Text style={[styles.settingText, { color: theme.textColor }]}>English</Text>
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
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16 },
  activeItem: { borderWidth: 2, borderColor: '#2ecc71' },
  hint: { fontSize: 12, marginBottom: 8, paddingHorizontal: 4 },
});

export default SettingsScreen;
