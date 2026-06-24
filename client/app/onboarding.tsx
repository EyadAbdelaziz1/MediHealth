import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../src/contexts/LanguageContext';
import { Button } from '../src/components/Button';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { t, isRTL } = useLanguage();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const slides = [
    { title: t('onboarding1Title'), desc: t('onboarding1Desc'), emoji: '🧠' },
    { title: t('onboarding2Title'), desc: t('onboarding2Desc'), emoji: '📷' },
    { title: t('onboarding3Title'), desc: t('onboarding3Desc'), emoji: '⏰' },
    { title: t('onboarding4Title'), desc: t('onboarding4Desc'), emoji: '📊' },
  ];

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', '1');
    router.replace('/login');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <LinearGradient colors={['#2563EB', '#0EA5E9']} style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'center' }]}>{item.title}</Text>
            <Text style={[styles.desc, { textAlign: isRTL ? 'right' : 'center' }]}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={index === slides.length - 1 ? t('getStarted') : t('next')}
          onPress={() => {
            if (index === slides.length - 1) finish();
            else ref.current?.scrollToIndex({ index: index + 1 });
          }}
          variant="secondary"
          style={{ backgroundColor: '#FFF', borderColor: '#FFF' }}
          textStyle={{ color: '#2563EB' }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80 },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  desc: { fontSize: 17, color: 'rgba(255,255,255,0.9)', lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: '#FFF' },
  footer: { padding: 24, paddingBottom: 48 },
});
