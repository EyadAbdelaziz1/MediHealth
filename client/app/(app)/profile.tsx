import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(t('logout'), isRTL ? 'هل تريد تسجيل الخروج؟' : 'Are you sure you want to logout?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'M'}</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user?.fullName}</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 24 }}>{user?.email}</Text>

      <Card style={{ marginBottom: 12 }}>
        <MenuItem label={t('settings')} onPress={() => router.push('/(app)/settings')} colors={colors} isRTL={isRTL} />
        <MenuItem label={t('reminders')} onPress={() => router.push('/(app)/reminders')} colors={colors} isRTL={isRTL} />
        <MenuItem label={t('analysisHistory')} onPress={() => router.push('/(app)/history')} colors={colors} isRTL={isRTL} />
      </Card>

      {user?.email === 'demo@medihealth.app' ? (
        <Card style={{ marginBottom: 16, backgroundColor: '#DBEAFE' }}>
          <Text style={{ fontWeight: '700', color: '#1D4ED8', textAlign: isRTL ? 'right' : 'left' }}>
            {t('demoNote')}
          </Text>
          <Text style={{ color: '#1E40AF', marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
            {t('demoSubtitle')}
          </Text>
        </Card>
      ) : null}

      <Button title={t('logout')} onPress={handleLogout} variant="danger" />
    </ScrollView>
  );
}

function MenuItem({
  label,
  onPress,
  colors,
  isRTL,
}: {
  label: string;
  onPress: () => void;
  colors: { text: string; textSecondary: string };
  isRTL: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
        {label}
      </Text>
      <Text style={{ color: colors.textSecondary }}>{isRTL ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 24, fontWeight: '800' },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
});
