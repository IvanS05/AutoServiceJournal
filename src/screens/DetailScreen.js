import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDetailViewModel } from '../viewmodels/detailViewModel';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

const DetailScreen = ({ route, navigation }) => {
  const { record } = route.params || {};
  const isEditing  = !!record;

  const {
    workType,     setWorkType,
    mileage,      setMileage,
    date,         setDate,
    reminderTime, setReminderTime,
    localImageUri,
    pickImage,
    clearImage,
    loading, error,
    save,
  } = useDetailViewModel(record);

  const { theme } = useTheme();
  const { t } = useTranslation();

  const [pickerMode, setPickerMode] = useState(null);
  const [tempDate,   setTempDate]   = useState(null);

  const reminderEnabled = !!reminderTime;

  const handleSave = async () => {
    const result = await save();
    if (result.success) {
      navigation.goBack();
    } else {
      const msg = result.error ? (t(result.error) || result.error) : t('error');
      Alert.alert(t('error'), msg);
    }
  };

  // ── Image picker ──────────────────────────────────────────────────────────
  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, selectionLimit: 1, includeBase64: true },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) pickImage(asset);
      }
    );
  };

  // ── Reminder ──────────────────────────────────────────────────────────────
  const toggleReminder = (enabled) => {
    if (enabled) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      setReminderTime(d.toISOString());
    } else {
      setReminderTime(null);
    }
  };

  const onPickerChange = (event, selected) => {
    if (event.type === 'dismissed' || !selected) {
      setPickerMode(null);
      setTempDate(null);
      return;
    }
    if (pickerMode === 'date') {
      if (Platform.OS === 'android') {
        setTempDate(selected);
        setPickerMode('time');
      } else {
        setReminderTime(selected.toISOString());
        setPickerMode(null);
      }
    } else {
      const base = tempDate || (reminderTime ? new Date(reminderTime) : new Date());
      base.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setReminderTime(base.toISOString());
      setPickerMode(null);
      setTempDate(null);
    }
  };

  const formatReminderTime = (iso) => {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const pickerValue = (() => {
    if (pickerMode === 'time' && tempDate) return tempDate;
    if (reminderTime) return new Date(reminderTime);
    return new Date();
  })();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.secondaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {isEditing ? t('editRecord') : t('addRecord')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        {/* Work type */}
        <Text style={[styles.label, { color: theme.textColor }]}>{t('workType')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, borderColor: theme.secondaryColor }]}
          value={workType}
          onChangeText={setWorkType}
          placeholder={t('enterWorkType')}
          placeholderTextColor={theme.secondaryColor}
          autoComplete="off"
          importantForAutofill="no"
          autoCorrect={false}
          spellCheck={false}
        />

        {/* Mileage */}
        <Text style={[styles.label, { color: theme.textColor, marginTop: 16 }]}>{t('mileage')} (км)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, borderColor: theme.secondaryColor }]}
          value={mileage}
          onChangeText={setMileage}
          placeholder="15000"
          placeholderTextColor={theme.secondaryColor}
          keyboardType="numeric"
        />

        {/* Date */}
        <Text style={[styles.label, { color: theme.textColor, marginTop: 16 }]}>{t('date')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, borderColor: theme.secondaryColor }]}
          value={date}
          onChangeText={setDate}
          placeholder="2024-01-15"
          placeholderTextColor={theme.secondaryColor}
        />

        {/* ── Photo section ── */}
        <Text style={[styles.label, { color: theme.textColor, marginTop: 16 }]}>{t('photo')}</Text>
        <View style={[styles.photoBox, { borderColor: theme.secondaryColor + '60', backgroundColor: theme.cardColor }]}>
          {localImageUri ? (
            <>
              <Image source={{ uri: localImageUri }} style={styles.photoPreview} resizeMode="cover" />
              <TouchableOpacity style={styles.photoRemoveBtn} onPress={clearImage}>
                <Icon name="cancel" size={26} color="#e74c3c" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={handlePickImage}>
              <Icon name="add-photo-alternate" size={48} color={theme.secondaryColor} />
              <Text style={[styles.photoPlaceholderText, { color: theme.secondaryColor }]}>
                {t('addPhoto')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {localImageUri && (
          <TouchableOpacity style={styles.photoChangeBtn} onPress={handlePickImage}>
            <Icon name="edit" size={16} color={theme.primaryColor} />
            <Text style={[styles.photoChangeBtnText, { color: theme.primaryColor }]}>{t('changePhoto')}</Text>
          </TouchableOpacity>
        )}

        {/* ── Reminder section ── */}
        <View style={[styles.reminderSection, { backgroundColor: theme.cardColor, borderColor: theme.secondaryColor + '50' }]}>
          <View style={styles.reminderToggleRow}>
            <Icon name="notifications" size={22} color={reminderEnabled ? theme.primaryColor : theme.secondaryColor} />
            <Text style={[styles.reminderLabel, { color: theme.textColor }]}>{t('reminder')}</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: '#767577', true: theme.primaryColor + '80' }}
              thumbColor={reminderEnabled ? theme.primaryColor : '#f4f3f4'}
            />
          </View>
          {reminderEnabled && (
            <TouchableOpacity
              style={[styles.timeRow, { borderTopColor: theme.secondaryColor + '30' }]}
              onPress={() => setPickerMode('date')}>
              <Icon name="access-time" size={18} color={theme.secondaryColor} />
              <Text style={[styles.timeText, { color: theme.textColor }]}>
                {reminderTime ? formatReminderTime(reminderTime) : t('chooseTime')}
              </Text>
              <Icon name="edit" size={16} color={theme.primaryColor} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primaryColor }, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.saveButtonText}>{t('save')}</Text>}
        </TouchableOpacity>
      </View>

      {pickerMode !== null && (
        <DateTimePicker
          value={pickerValue}
          mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={onPickerChange}
        />
      )}
    </ScrollView>
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
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  photoBox: {
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 13,
  },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  photoPlaceholderText: { fontSize: 14 },
  photoChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  photoChangeBtnText: { fontSize: 13 },

  reminderSection: {
    marginTop: 24,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  reminderLabel: { flex: 1, fontSize: 16 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  timeText: { fontSize: 15 },

  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default DetailScreen;
