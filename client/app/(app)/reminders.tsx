import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';

export default function RemindersScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reminders/${id}/complete`, { status: 'taken' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const missMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reminders/${id}/complete`, { status: 'missed' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });

  if (isLoading) return <LoadingScreen />;

  const reminders = data?.reminders || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left', padding: 20, paddingTop: 56 }]}>
        {t('reminders')}
      </Text>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id || item.$id}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        onRefresh={refetch}
        refreshing={false}
        ListEmptyComponent={<EmptyState title={t('noResults')} icon="⏰" />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Text style={[styles.med, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {item.medication?.name || '—'}
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }}>
              {item.time} • {item.frequency || t('daily')}
            </Text>
            <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button
                title={t('markCompleted')}
                onPress={() => completeMutation.mutate(item.id || item.$id)}
                variant="primary"
                fullWidth={false}
                style={{ flex: 1, marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0, minHeight: 44, paddingVertical: 10 }}
              />
              <Button
                title={t('markMissed')}
                onPress={() => missMutation.mutate(item.id || item.$id)}
                variant="outline"
                fullWidth={false}
                style={{ flex: 1, minHeight: 44, paddingVertical: 10 }}
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800' },
  med: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  actions: { marginTop: 12, gap: 8 },
});
