import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/services/api';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { LoadingScreen } from '../../../src/components/LoadingScreen';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isRTL, language } = useLanguage();
  const { colors } = useTheme();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['medication', id],
    queryFn: () => api.get(`/medications/${id}`),
  });

  const analyzeMutation = useMutation({
    mutationFn: () =>
      api.post('/analysis/analyze', {
        medications: [data.medication.name],
        language,
      }),
    onSuccess: (res) => {
      router.push(`/(app)/analysis/${res.report.id}`);
    },
    onError: (e: Error) => Alert.alert(t('error'), e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/medications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications'] });
      router.back();
    },
  });

  if (isLoading) return <LoadingScreen />;
  const med = data?.medication;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {med.name}
      </Text>

      <Card>
        {[
          [t('dosage'), med.dosage],
          [t('activeIngredient'), med.activeIngredient],
          [t('form'), med.form],
          [t('instructions'), med.instructions],
          [t('prescribedBy'), med.prescribedBy],
          [t('notes'), med.notes],
        ].map(([label, value]) =>
          value ? (
            <View key={label as string} style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {label}
              </Text>
              <Text style={{ color: colors.text, textAlign: isRTL ? 'right' : 'left' }}>{value as string}</Text>
            </View>
          ) : null
        )}
      </Card>

      <Button title={t('analysisResults')} onPress={() => analyzeMutation.mutate()} loading={analyzeMutation.isPending} style={{ marginTop: 16 }} />
      <Button
        title={t('delete')}
        variant="danger"
        onPress={() =>
          Alert.alert(t('delete'), t('deleteConfirmation'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('delete'), style: 'destructive', onPress: () => deleteMutation.mutate() },
          ])
        }
        style={{ marginTop: 12 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  row: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
});
