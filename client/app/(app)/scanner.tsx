import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';

export default function ScannerScreen() {
  const { t, isRTL, language } = useLanguage();
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [detected, setDetected] = useState<Array<{ name: string; dosage: string }>>([]);

  const pickImage = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('error'), 'Permission required');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });

    if (!result.canceled && result.assets[0]?.base64) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(uri);
      setDetected([]);
    }
  };

  const scanMutation = useMutation({
    mutationFn: () =>
      api.post('/scan/analyze', { imageData: image, symptoms, notes, language }),
    onSuccess: (data) => {
      router.push({
        pathname: '/(app)/analysis/[id]',
        params: { id: data.report.id, result: JSON.stringify(data.result) },
      });
    },
    onError: (e: Error) => Alert.alert(t('error'), e.message),
  });

  const extractMutation = useMutation({
    mutationFn: () => api.post('/scan/extract', { imageData: image }),
    onSuccess: (data) => setDetected(data.medications || []),
    onError: (e: Error) => Alert.alert(t('error'), e.message),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('scanMedication')}
      </Text>

      <View style={styles.actions}>
        <Button title={t('takePhoto')} onPress={() => pickImage(true)} variant="primary" style={styles.halfBtn} fullWidth={false} />
        <Button title={t('uploadImage')} onPress={() => pickImage(false)} variant="outline" style={styles.halfBtn} fullWidth={false} />
      </View>

      {image ? (
        <Card style={styles.preview}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        </Card>
      ) : null}

      {detected.length > 0 ? (
        <Card>
          <Text style={[styles.subtitle, { color: colors.text }]}>{t('detectedMedications')}</Text>
          {detected.map((m, i) => (
            <Text key={i} style={{ color: colors.textSecondary, marginTop: 4 }}>
              • {m.name} {m.dosage ? `(${m.dosage})` : ''}
            </Text>
          ))}
        </Card>
      ) : null}

      <Input label={t('notes')} value={symptoms} onChangeText={setSymptoms} placeholder={language === 'ar' ? 'الأعراض...' : 'Symptoms...'} multiline />
      <Input label={t('notes')} value={notes} onChangeText={setNotes} multiline />

      {image ? (
        <>
          <Button
            title={t('detected')}
            onPress={() => extractMutation.mutate()}
            variant="secondary"
            loading={extractMutation.isPending}
          />
          <Button
            title={t('analyzing').replace('...', '')}
            onPress={() => scanMutation.mutate()}
            loading={scanMutation.isPending}
          />
        </>
      ) : null}

      <TouchableOpacity onPress={() => router.push('/(app)/history')} style={{ marginTop: 16 }}>
        <Text style={{ color: colors.primary, textAlign: 'center', fontWeight: '600' }}>{t('analysisHistory')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfBtn: { flex: 1 },
  preview: { marginBottom: 16, overflow: 'hidden' },
  image: { width: '100%', height: 220, borderRadius: 12 },
  subtitle: { fontWeight: '700', marginBottom: 8 },
});
