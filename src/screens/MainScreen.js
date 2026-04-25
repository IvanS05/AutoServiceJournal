import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMainViewModel } from '../viewmodels/mainViewModel';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SORT_FIELDS = [
  { key: 'date',     icon: 'calendar-today' },
  { key: 'mileage',  icon: 'speed' },
  { key: 'workType', icon: 'build' },
];

const MainScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    records,
    loadRecords,
    handleDelete,
    searchQuery,
    setSearchQuery,
    sortField,
    sortOrder,
    toggleSort,
    filterMileageMin,
    setFilterMileageMin,
    filterMileageMax,
    setFilterMileageMax,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    clearFilters,
    hasActiveFilters,
    totalCount,
  } = useMainViewModel();

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadRecords();
    const unsubscribe = navigation.addListener('focus', loadRecords);
    return unsubscribe;
  }, [navigation, loadRecords]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersOpen(v => !v);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      t('deleteTitle'),
      t('deleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), onPress: () => handleDelete(id), style: 'destructive' },
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
      <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
        <Icon name="delete" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const sortOrderIcon = sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward';

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.secondaryColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {t('serviceJournal')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginRight: 12 }} onPress={() => navigation.navigate('VIN')}>
            <Icon name="qr_code" size={26} color={theme.primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={28} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: theme.cardColor }]}>
        <Icon name="search" size={20} color={theme.secondaryColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.textColor }]}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={theme.secondaryColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color={theme.secondaryColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort row */}
      <View style={[styles.sortRow, { borderBottomColor: theme.secondaryColor + '40' }]}>
        <Text style={[styles.sortLabel, { color: theme.secondaryColor }]}>
          {t('sortBy')}:
        </Text>
        {SORT_FIELDS.map(({ key, icon }) => {
          const active = sortField === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.sortBtn,
                active && { backgroundColor: theme.primaryColor + '22' },
              ]}
              onPress={() => toggleSort(key)}>
              <Icon name={icon} size={15} color={active ? theme.primaryColor : theme.secondaryColor} />
              <Text style={[styles.sortBtnText, { color: active ? theme.primaryColor : theme.secondaryColor }]}>
                {t('sort_' + key)}
              </Text>
              {active && (
                <Icon name={sortOrderIcon} size={13} color={theme.primaryColor} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter toggle */}
      <TouchableOpacity
        style={[
          styles.filterToggle,
          { borderBottomColor: theme.secondaryColor + '40' },
          hasActiveFilters && { backgroundColor: theme.primaryColor + '18' },
        ]}
        onPress={toggleFilters}>
        <Icon
          name="filter-list"
          size={18}
          color={hasActiveFilters ? theme.primaryColor : theme.secondaryColor}
        />
        <Text style={[styles.filterToggleText, { color: hasActiveFilters ? theme.primaryColor : theme.secondaryColor }]}>
          {t('filters')}
          {hasActiveFilters ? ` (${t('active')})` : ''}
        </Text>
        <Icon
          name={filtersOpen ? 'expand-less' : 'expand-more'}
          size={20}
          color={theme.secondaryColor}
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>

      {/* Filter panel */}
      {filtersOpen && (
        <View style={[styles.filterPanel, { backgroundColor: theme.cardColor, borderBottomColor: theme.secondaryColor + '40' }]}>
          {/* Mileage */}
          <Text style={[styles.filterGroupLabel, { color: theme.secondaryColor }]}>
            {t('mileage')}
          </Text>
          <View style={styles.filterRangeRow}>
            <TextInput
              style={[styles.filterInput, { borderColor: theme.secondaryColor + '60', color: theme.textColor }]}
              placeholder={t('from')}
              placeholderTextColor={theme.secondaryColor}
              keyboardType="numeric"
              value={filterMileageMin}
              onChangeText={setFilterMileageMin}
            />
            <Text style={[styles.filterDash, { color: theme.secondaryColor }]}>—</Text>
            <TextInput
              style={[styles.filterInput, { borderColor: theme.secondaryColor + '60', color: theme.textColor }]}
              placeholder={t('to')}
              placeholderTextColor={theme.secondaryColor}
              keyboardType="numeric"
              value={filterMileageMax}
              onChangeText={setFilterMileageMax}
            />
          </View>

          {/* Date */}
          <Text style={[styles.filterGroupLabel, { color: theme.secondaryColor }]}>
            {t('date')} (YYYY-MM-DD)
          </Text>
          <View style={styles.filterRangeRow}>
            <TextInput
              style={[styles.filterInput, { borderColor: theme.secondaryColor + '60', color: theme.textColor }]}
              placeholder={t('from')}
              placeholderTextColor={theme.secondaryColor}
              value={filterDateFrom}
              onChangeText={setFilterDateFrom}
            />
            <Text style={[styles.filterDash, { color: theme.secondaryColor }]}>—</Text>
            <TextInput
              style={[styles.filterInput, { borderColor: theme.secondaryColor + '60', color: theme.textColor }]}
              placeholder={t('to')}
              placeholderTextColor={theme.secondaryColor}
              value={filterDateTo}
              onChangeText={setFilterDateTo}
            />
          </View>

          {hasActiveFilters && (
            <TouchableOpacity style={[styles.clearBtn, { borderColor: '#e74c3c' }]} onPress={clearFilters}>
              <Icon name="clear" size={15} color="#e74c3c" />
              <Text style={[styles.clearBtnText, { color: '#e74c3c' }]}>{t('clearFilters')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* List or empty state */}
      {totalCount === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="build" size={80} color={theme.secondaryColor} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>{t('noRecords')}</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={80} color={theme.secondaryColor} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>{t('noResults')}</Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 1,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    gap: 4,
  },
  sortLabel: { fontSize: 12, marginRight: 4 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 3,
  },
  sortBtnText: { fontSize: 12 },

  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 6,
  },
  filterToggleText: { fontSize: 13 },

  filterPanel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterGroupLabel: { fontSize: 12, marginBottom: 4, marginTop: 6 },
  filterRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  filterDash: { fontSize: 16 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  clearBtnText: { fontSize: 13 },

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

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
