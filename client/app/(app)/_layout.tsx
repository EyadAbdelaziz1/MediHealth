import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { LoadingScreen } from '../../src/components/LoadingScreen';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.card : '#FFF',
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: t('medications'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💊</Text>,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t('scanMedication'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('analysisHistory'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
      <Tabs.Screen name="analysis/[id]" options={{ href: null }} />
      <Tabs.Screen name="medications/[id]" options={{ href: null }} />
      <Tabs.Screen name="medications/add" options={{ href: null }} />
      <Tabs.Screen name="reminders" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="analyze" options={{ href: null }} />
    </Tabs>
  );
}
