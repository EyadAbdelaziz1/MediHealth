import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../src/services/auth';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

export default function ResetPasswordScreen() {
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState(paramEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert(t('done'), isRTL ? 'تم إعادة تعيين كلمة المرور' : 'Password reset successful');
      router.replace('/login');
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t('changePassword')}
      </Text>
      <Input label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
      <Input label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Button title={t('submit')} onPress={submit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
});
