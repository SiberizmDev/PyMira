import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TextProps extends RNTextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption';
}

export function Text({ style, variant = 'default', ...props }: TextProps) {
  const { colors } = useTheme();

  const variantStyles = {
    default: {
      color: colors.text,
      fontSize: 16,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 18,
    },
    caption: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  };

  return (
    <RNText
      style={[variantStyles[variant], style]}
      {...props}
    />
  );
} 