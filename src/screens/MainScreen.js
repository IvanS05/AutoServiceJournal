import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRecords, deleteRecord } from '../database/database';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

const MainScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadRecords();
    const unsubscribe = navigation.addListener('focus', loadRecords);
    return unsubscribe;
  }, [navigation]);

  const loadRecords = async () => {
    const data = await getRecords();
    setRecords(data);
  };

  const handleDelete = (id) => {
    Alert.alert(
      t('deleteTitle'),
      t('deleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          onPress: () => {
            deleteRecord(id);
            loadRecords();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderRecord = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardColor }]}
      onPress={() => navigation.navigate('Detail', { record: item })}>
      <View style={styles.cardContent}>
        <Text style={[styles.workType, { color: theme.textColor }]}>
          {item.workType}
        </Text>
        <Text style={[styles.mileage, { color: theme.secondaryColor }]}>
          {t('mileage')}: {item.mileage} км
        </Text>
        <Text style={[styles.date, { color: theme.secondaryColor }]}>
          {t('date')}: {item.date}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}>
        <Icon name="delete" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: theme.secondaryColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {t('serviceJournal')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={28} color={theme.primaryColor} />
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="build" size={80} color={theme.secondaryColor} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            {t('noRecords')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primaryColor }]}
        onPress={() => navigation.navigate('Detail', { record: null })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
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
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  workType: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  mileage: { fontSize: 14, marginBottom: 2 },
  date: { fontSize: 14 },
  deleteButton: { justifyContent: 'center', paddingHorizontal: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 18, marginTop: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default MainScreen;