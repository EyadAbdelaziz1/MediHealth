import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/Card';
import { SafetyScoreBadge } from '../../src/components/SafetyScoreBadge';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { Button } from '../../src/components/Button';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { colors } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/profile/dashboard'),
  });

  if (isLoading) return <LoadingScreen />;

  const meds = data?.activeMedications || [];
  const reminders = data?.upcomingReminders || [];
  const analyses = data?.recentAnalyses || [];
  const score = data?.safetyScore ?? 85;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <LinearGradient colors={['#2563EB', '#0EA5E9']} style={styles.header}>
        <Text style={[styles.greeting, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('welcome')}، {user?.fullName?.split(' ')[0]}
        </Text>
        <Text style={styles.subtitle}>{t('tagline')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.scoreCard}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('safetyScore')}
          </Text>
          <View style={styles.scoreRow}>
            <SafetyScoreBadge score={score} />
            <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/(app)/scanner')}>
              <Text style={styles.scanBtnText}>📷 {t('quickScan')}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left', marginTop: 8 }]}>
          {t('activeMedications')} ({meds.length})
        </Text>
        {meds.length === 0 ? (
          <EmptyState title={t('noMedications')} description={t('noMedicationsDesc')} />
        ) : (
          meds.slice(0, 4).map((m: Record<string, unknown>) => (
            <TouchableOpacity
              key={m.$id as string}
              onPress={() => router.push(`/(app)/medications/${m.$id}`)}
            >
              <Card style={styles.listItem}>
                <Text style={[styles.medName, { color: colors.text }]}>{m.name as string}</Text>
                <Text style={{ color: colors.textSecondary }}>{m.dosage as string}</Text>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <View style={[styles.rowBetween, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('upcomingReminders')}</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/reminders')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('reminders')}</Text>
          </TouchableOpacity>
        </View>
        {reminders.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }}>
            —
          </Text>
        ) : (
          reminders.slice(0, 3).map((r: Record<string, unknown>) => (
            <Card key={r.$id as string} style={styles.listItem}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {(r.medication as { name?: string })?.name || '—'} — {r.time as string}
              </Text>
            </Card>
          ))
        )}

        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left', marginTop: 16 }]}>
          {t('recentAnalysis')}
        </Text>
        <Button
          title={language === 'ar' ? 'تحليل أدوية يدوي' : 'Manual Analysis'}
          onPress={() => router.push('/(app)/analyze')}
          variant="outline"
          style={{ marginBottom: 16 }}
        />

        {analyses.length === 0 ? (
          <EmptyState title={t('noHistory')} description={t('noHistoryDesc')} icon="📊" />
        ) : (
          analyses.map((a: Record<string, unknown>) => (
            <TouchableOpacity key={a.id as string} onPress={() => router.push(`/(app)/analysis/${a.id}`)}>
              <Card style={styles.listItem}>
                <View style={[styles.rowBetween, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>
                    {((a.medications as { names?: string[] })?.names || []).join(', ')}
                  </Text>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>{a.safetyScore as number}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  content: { padding: 20, marginTop: -16 },
  scoreCard: { marginBottom: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  scanBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  scanBtnText: { color: '#FFF', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  listItem: { marginBottom: 10 },
  medName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rowBetween: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
});
