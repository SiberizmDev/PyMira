import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function ScreenLayout({ children, scrollable = true, style }: ScreenLayoutProps) {
  const { colors } = useTheme();

  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style
      ]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={scrollable ? styles.scrollContent : undefined}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Tab bar yüksekliği + margin
  },
}); 