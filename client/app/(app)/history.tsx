import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { SafetyScoreBadge } from '../../src/components/SafetyScoreBadge';

export default function HistoryScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: () => api.get('/analysis'),
  });

  if (isLoading) return <LoadingScreen />;

  const reports = data?.reports || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left', padding: 20, paddingTop: 56 }]}>
        {t('analysisHistory')}
      </Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        ListEmptyComponent={<EmptyState title={t('noHistory')} description={t('noHistoryDesc')} icon="📋" />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(app)/analysis/${item.id}`)}>
            <Card style={{ marginBottom: 12 }}>
              <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.names, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    {(item.medications?.names || []).join(', ')}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </Text>
                </View>
                <SafetyScoreBadge score={item.safetyScore} size="sm" />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800' },
  row: { alignItems: 'center', gap: 12 },
  names: { fontSize: 15, fontWeight: '600' },
});
