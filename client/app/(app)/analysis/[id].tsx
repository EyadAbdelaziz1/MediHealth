import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/services/api';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { Card } from '../../../src/components/Card';
import { SafetyScoreBadge } from '../../../src/components/SafetyScoreBadge';
import { LoadingScreen } from '../../../src/components/LoadingScreen';

export default function AnalysisDetailScreen() {
  const { id, result: resultParam } = useLocalSearchParams<{ id: string; result?: string }>();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => api.get(`/analysis/${id}`),
    enabled: !!id && !resultParam,
  });

  if (isLoading && !resultParam) return <LoadingScreen />;

  const report = data?.report;
  const result = resultParam
    ? JSON.parse(resultParam)
    : report?.results || {};

  const sections = [
    { key: 'interactions', title: t('interactions'), items: result.interactions },
    { key: 'sideEffects', title: t('sideEffects'), items: result.sideEffects },
    { key: 'foodInteractions', title: t('foodInteractions'), items: result.foodInteractions },
    { key: 'safetyConcerns', title: t('safetyConcerns'), items: (result.safetyConcerns || []).map((s: string) => ({ text: s })) },
    { key: 'recommendations', title: t('recommendations'), items: (result.recommendations || []).map((s: string) => ({ text: s })) },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('analysisResults')}
      </Text>

      <Card style={styles.scoreSection}>
        <SafetyScoreBadge score={result.score || report?.safetyScore || 70} />
        {result.verificationMessage ? (
          <Text style={[styles.verify, { color: '#F59E0B', textAlign: isRTL ? 'right' : 'center' }]}>
            ⚠️ {result.verificationMessage}
          </Text>
        ) : null}
      </Card>

      {sections.map((section) =>
        section.items?.length ? (
          <Card key={section.key} style={{ marginTop: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {section.title}
            </Text>
            {section.items.map((item: Record<string, string>, i: number) => (
              <View key={i} style={styles.item}>
                <Text style={{ color: colors.text, textAlign: isRTL ? 'right' : 'left', lineHeight: 22 }}>
                  • {item.text || item.description || item.advice || `${item.drug}: ${item.description}` || item.symptom}
                </Text>
              </View>
            ))}
          </Card>
        ) : null
      )}

      <Card style={{ marginTop: 16, backgroundColor: '#FEF3C7' }}>
        <Text style={[styles.disclaimer, { textAlign: isRTL ? 'right' : 'left' }]}>
          ⚕️ {result.disclaimer || t('disclaimerText')}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  scoreSection: { alignItems: 'center' },
  verify: { marginTop: 12, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  item: { marginTop: 8 },
  disclaimer: { fontSize: 13, color: '#92400E', lineHeight: 20 },
});
