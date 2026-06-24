import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/contexts/AuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = async () => {
    setLoading(true);
    try {
      await login('demo@medihealth.app', 'Demo123!');
      router.replace('/(app)');
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
        <LinearGradient colors={['#2563EB', '#0EA5E9']} style={styles.header}>
          <Text style={styles.logo}>🩺</Text>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('login')}
          </Text>

          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="email@example.com"
          />
          <Input
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={t('signIn')} onPress={handleLogin} loading={loading} />

          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={[styles.linkText, { color: colors.primary }]}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={{ color: colors.textSecondary, marginHorizontal: 12 }}>{t('or')}</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <Button title={t('enterDemo')} onPress={enterDemo} variant="outline" loading={loading} />

          <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={{ color: colors.textSecondary }}>{t('noAccount')} </Text>
            <Link href="/register">
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('signUp')}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: { paddingTop: 72, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logo: { fontSize: 56, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  form: { padding: 24, marginTop: -20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  error: { color: '#EF4444', marginBottom: 12, textAlign: 'center' },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1 },
  footer: { justifyContent: 'center', marginTop: 24 },
});
