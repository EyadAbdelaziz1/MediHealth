import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const variants = {
    primary: { bg: '#2563EB', text: '#FFF', border: '#2563EB' },
    secondary: { bg: '#0EA5E9', text: '#FFF', border: '#0EA5E9' },
    outline: { bg: 'transparent', text: '#2563EB', border: '#2563EB' },
    ghost: { bg: 'transparent', text: '#64748B', border: 'transparent' },
    danger: { bg: '#EF4444', text: '#FFF', border: '#EF4444' },
  };

  const v = variants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: disabled || loading ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 54,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
