import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirm) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim(), language);
      router.replace('/(app)');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('register')}
        </Text>

        <Input label={t('fullName')} value={fullName} onChangeText={setFullName} />
        <Input label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label={t('password')} value={password} onChangeText={setPassword} secureTextEntry />
        <Input label={t('confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={t('signUp')} onPress={handleRegister} loading={loading} />

        <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={{ color: colors.textSecondary }}>{t('hasAccount')} </Text>
          <Link href="/login">
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('signIn')}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 32 },
  error: { color: '#EF4444', marginBottom: 12 },
  footer: { justifyContent: 'center', marginTop: 24 },
});
