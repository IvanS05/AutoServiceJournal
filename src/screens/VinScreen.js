import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNewsViewModel } from '../viewmodels/newsViewModel';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

// VIN Lookup screen (formerly NewsScreen)
const VinScreen = ({ navigation }) => {
  const [vin, setVin] = useState('');
  const { vehicle, loading, error, lookup } = useNewsViewModel();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const onSearch = () => lookup(vin.trim());

  const results = vehicle?.Results || [];
  const [showAll, setShowAll] = useState(false);

  const importantKeys = [
    'Make',
    'Manufacturer Name',
    'Model',
    'Model Year',
    'Trim',
    'Vehicle Type',
    'Plant City',
    'Series',
    'Vehicle Descriptor',
  ];

  const filtered = results.filter((r) => {
    const v = r.Value;
    return showAll || (v !== null && v !== undefined && String(v).trim() !== '' && importantKeys.includes(r.Variable));
  });

  const renderPair = ({ item }) => (
    <View style={[styles.pair, { backgroundColor: theme.cardColor }]}> 
      <Text style={[styles.pairName, { color: theme.secondaryColor }]}>{item.Variable}</Text>
      <Text style={[styles.pairValue, { color: theme.textColor }]}>{String(item.Value || '')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: theme.secondaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>{t('vinLookup') || 'VIN Lookup'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, borderColor: theme.secondaryColor }]}
          value={vin}
          onChangeText={setVin}
          placeholder={t('enterVin')}
          placeholderTextColor={theme.secondaryColor}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primaryColor }]} onPress={onSearch}>
          <Icon name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.primaryColor} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={{ color: theme.textColor }}>{error}</Text></View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity onPress={() => setShowAll((s) => !s)} style={[styles.toggleBtn, { borderColor: theme.secondaryColor }]}>
              <Text style={{ color: theme.primaryColor }}>{showAll ? (t('showFiltered') || 'Show filtered') : (t('showAllFields') || 'Show all fields')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item, idx) => `${item.Variable}_${idx}`}
            renderItem={renderPair}
            contentContainerStyle={{ padding: 16 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  input: { flex: 1, height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
  btn: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pair: { padding: 12, borderRadius: 8, marginBottom: 8 },
  pairName: { fontSize: 12 },
  pairValue: { fontSize: 14, fontWeight: '600' },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 12,
  },
});

export default VinScreen;
