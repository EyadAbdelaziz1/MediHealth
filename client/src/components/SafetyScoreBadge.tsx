import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface SafetyScoreBadgeProps {
  score: number;
  size?: 'sm' | 'lg';
}

function getCategory(score: number) {
  if (score >= 80) return { key: 'safe', color: '#10B981', bg: '#D1FAE5', ar: 'آمن', en: 'Safe' };
  if (score >= 60) return { key: 'monitor', color: '#F59E0B', bg: '#FEF3C7', ar: 'مراقبة', en: 'Monitor' };
  if (score >= 40) return { key: 'warning', color: '#F97316', bg: '#FFEDD5', ar: 'تحذير', en: 'Warning' };
  return { key: 'high', color: '#EF4444', bg: '#FEE2E2', ar: 'خطر مرتفع', en: 'High Risk' };
}

export function SafetyScoreBadge({ score, size = 'lg' }: SafetyScoreBadgeProps) {
  const { language } = useLanguage();
  const cat = getCategory(score);
  const isLarge = size === 'lg';

  return (
    <View style={[styles.container, { backgroundColor: cat.bg }, isLarge && styles.large]}>
      <Text style={[styles.score, { color: cat.color, fontSize: isLarge ? 42 : 28 }]}>{score}</Text>
      <Text style={[styles.label, { color: cat.color }]}>
        {language === 'ar' ? cat.ar : cat.en}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 16,
    minWidth: 100,
  },
  large: { padding: 24, minWidth: 140 },
  score: { fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 4 },
});
