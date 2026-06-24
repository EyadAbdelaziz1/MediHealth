import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { authService } from '../../src/services/auth';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function SettingsScreen() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { colors, mode, setMode, isDark } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert(t('done'), isRTL ? 'تم تغيير كلمة المرور' : 'Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('settings')}
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={[styles.section, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('language')}
        </Text>
        <View style={[styles.langRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Button
            title={t('arabic')}
            variant={language === 'ar' ? 'primary' : 'outline'}
            onPress={() => setLanguage('ar')}
            fullWidth={false}
            style={{ flex: 1, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
          />
          <Button
            title={t('english')}
            variant={language === 'en' ? 'primary' : 'outline'}
            onPress={() => setLanguage('en')}
            fullWidth={false}
            style={{ flex: 1 }}
          />
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={{ color: colors.text, fontWeight: '600', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
          {mode === 'system' ? 'System' : mode}
        </Text>
      </Card>

      <Card>
        <Text style={[styles.section, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('changePassword')}
        </Text>
        <Input label={t('currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Input label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Button title={t('saveChanges')} onPress={changePassword} loading={loading} />
      </Card>

      <Button title={t('back')} onPress={() => router.back()} variant="ghost" style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  langRow: { gap: 8 },
  row: { alignItems: 'center' },
});
