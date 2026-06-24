import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export function EmptyState({ title, description, icon = '💊' }: EmptyStateProps) {
  const { colors } = useTheme();
  const { isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[styles.desc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'center' }]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 22 },
});
