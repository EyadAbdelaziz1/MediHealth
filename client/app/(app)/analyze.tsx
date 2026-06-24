import { useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function ManualAnalyzeScreen() {
  const { t, isRTL, language } = useLanguage();
  const { colors } = useTheme();
  const [medications, setMedications] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/analysis/analyze', {
        medications: medications.split(',').map((m) => m.trim()).filter(Boolean),
        symptoms,
        notes,
        language,
      }),
    onSuccess: (data) => router.push(`/(app)/analysis/${data.report.id}`),
    onError: (e: Error) => Alert.alert(t('error'), e.message),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('analysisResults')}
      </Text>
      <Input
        label={t('medications')}
        value={medications}
        onChangeText={setMedications}
        placeholder={language === 'ar' ? 'مثال: Metformin, Aspirin' : 'e.g. Metformin, Aspirin'}
      />
      <Input label={language === 'ar' ? 'الأعراض' : 'Symptoms'} value={symptoms} onChangeText={setSymptoms} multiline />
      <Input label={t('notes')} value={notes} onChangeText={setNotes} multiline />
      <Button title={t('submit')} onPress={() => mutation.mutate()} loading={mutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
});
