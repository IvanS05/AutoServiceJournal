import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addRecord, updateRecord } from '../database/database';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

const DetailScreen = ({ route, navigation }) => {
  const { record } = route.params || {};
  const isEditing = !!record;

  const [workType, setWorkType] = useState(record?.workType || '');
  const [mileage, setMileage] = useState(record?.mileage?.toString() || '');
  const [date, setDate] = useState(record?.date || '');

  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!workType.trim() || !mileage.trim() || !date.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    const mileageNum = parseInt(mileage);
    if (isNaN(mileageNum)) {
      Alert.alert(t('error'), t('mileageMustBeNumber'));
      return;
    }

    const recordData = {
      workType: workType.trim(),
      mileage: mileageNum,
      date: date.trim(),
    };

    if (isEditing) {
      await updateRecord({ ...recordData, id: record.id });
    } else {
      await addRecord(recordData);
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
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
        <Text style={[styles.label, { color: theme.textColor }]}>
          {t('workType')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.cardColor,
            color: theme.textColor,
            borderColor: theme.secondaryColor 
          }]}
          value={workType}
          onChangeText={setWorkType}
          placeholder={t('enterWorkType')}
          placeholderTextColor={theme.secondaryColor}
          autoComplete="off"
          allowFontScaling={true}           // Добавь
          importantForAutofill="no"         // Добавь (для Android)
          autoCorrect={false}               // Добавь
          spellCheck={false}                // Добавь
        />

        <Text style={[styles.label, { color: theme.textColor, marginTop: 16 }]}>
          {t('mileage')} (км)
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.cardColor,
            color: theme.textColor,
            borderColor: theme.secondaryColor 
          }]}
          value={mileage}
          onChangeText={setMileage}
          placeholder="15000"
          placeholderTextColor={theme.secondaryColor}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textColor, marginTop: 16 }]}>
          {t('date')}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.cardColor,
            color: theme.textColor,
            borderColor: theme.secondaryColor 
          }]}
          value={date}
          onChangeText={setDate}
          placeholder="2024-01-15"
          placeholderTextColor={theme.secondaryColor}
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
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
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailScreen;