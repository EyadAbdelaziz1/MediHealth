import { useState } from 'react';
import { ScrollView, Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/services/api';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';

export default function AddMedicationScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    activeIngredient: '',
    form: '',
    instructions: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: () => api.post('/medications', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert(t('error'), e.message),
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('addMedication')}
      </Text>
      <Input label={t('medications')} value={form.name} onChangeText={(v) => set('name', v)} />
      <Input label={t('dosage')} value={form.dosage} onChangeText={(v) => set('dosage', v)} />
      <Input label={t('activeIngredient')} value={form.activeIngredient} onChangeText={(v) => set('activeIngredient', v)} />
      <Input label={t('form')} value={form.form} onChangeText={(v) => set('form', v)} />
      <Input label={t('instructions')} value={form.instructions} onChangeText={(v) => set('instructions', v)} multiline />
      <Input label={t('notes')} value={form.notes} onChangeText={(v) => set('notes', v)} multiline />
      <Button title={t('save')} onPress={() => mutation.mutate()} loading={mutation.isPending} />
      <Button title={t('cancel')} onPress={() => router.back()} variant="ghost" style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
});
