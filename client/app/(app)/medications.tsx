import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingScreen } from '../../src/components/LoadingScreen';

export default function MedicationsScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['medications'],
    queryFn: () => api.get('/medications'),
  });

  if (isLoading) return <LoadingScreen />;

  const medications = data?.medications || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('medications')}</Text>
        <Button
          title={`+ ${t('addMedication')}`}
          onPress={() => router.push('/(app)/medications/add')}
          fullWidth={false}
          style={{ paddingHorizontal: 16, paddingVertical: 10, minHeight: 44 }}
        />
      </View>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.$id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        ListEmptyComponent={<EmptyState title={t('noMedications')} description={t('noMedicationsDesc')} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(app)/medications/${item.$id}`)}>
            <Card style={{ marginBottom: 12 }}>
              <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }}>
                    {item.dosage} • {item.activeIngredient}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.isActive !== false ? '#D1FAE5' : '#F1F5F9' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: item.isActive !== false ? '#065F46' : '#64748B' }}>
                    {item.isActive !== false ? t('active') : t('inactive')}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: { paddingHorizontal: 20, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  row: { alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
