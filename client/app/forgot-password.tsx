import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../src/services/auth';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

export default function ForgotPasswordScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      Alert.alert(t('done'), languageMessage(isRTL));
      router.push({ pathname: '/reset-password', params: { email } });
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('forgotPassword')}
      </Text>
      <Input label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Button title={t('submit')} onPress={submit} loading={loading} />
    </View>
  );
}

function languageMessage(isRTL: boolean) {
  return isRTL
    ? 'إذا كان الحساب موجوداً، تم إرسال رمز إعادة التعيين.'
    : 'If an account exists, a reset code has been sent.';
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
});
