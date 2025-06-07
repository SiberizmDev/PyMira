import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, TrendingUp, PieChart } from 'lucide-react-native';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { colors } = useTheme();

  const features = [
    {
      icon: <Wallet size={24} color={colors.primary} />,
      title: 'Akıllı Para Yönetimi',
      description: 'Gelir ve giderlerinizi kolayca takip edin',
    },
    {
      icon: <TrendingUp size={24} color={colors.success} />,
      title: 'Birikim Önerileri',
      description: 'Kişiselleştirilmiş finansal tavsiyelere ulaşın',
    },
    {
      icon: <PieChart size={24} color={colors.accent} />,
      title: 'Detaylı Analizler',
      description: 'Harcama alışkanlıklarınızı analiz edin',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Para Yöneticisine Hoş Geldiniz!
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Finansal durumunuzu kontrol altında tutmak için birkaç basit adımda kurulumu tamamlayalım.
      </Text>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Button
        title="Kuruluma Başla"
        onPress={onNext}
        size="large"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
  },
});