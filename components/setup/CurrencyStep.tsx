import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CurrencySelector } from '@/components/CurrencySelector';
import { DEFAULT_CURRENCY } from '@/constants/currencies';

interface CurrencyStepProps {
  onNext: (expenseCurrencies: string[], incomeCurrencies: string[]) => void;
  onBack: () => void;
}

export function CurrencyStep({ onNext, onBack }: CurrencyStepProps) {
  const { colors } = useTheme();
  const [expenseCurrencies, setExpenseCurrencies] = useState<string[]>([DEFAULT_CURRENCY]);
  const [incomeCurrencies, setIncomeCurrencies] = useState<string[]>([DEFAULT_CURRENCY]);

  const handleNext = () => {
    onNext(expenseCurrencies, incomeCurrencies);
  };

  const toggleCurrency = (currency: string, type: 'expense' | 'income') => {
    if (type === 'expense') {
      setExpenseCurrencies(prev => {
        if (prev.includes(currency)) {
          return prev.filter(c => c !== currency);
        } else {
          return [...prev, currency];
        }
      });
    } else {
      setIncomeCurrencies(prev => {
        if (prev.includes(currency)) {
          return prev.filter(c => c !== currency);
        } else {
          return [...prev, currency];
        }
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>
        Para Birimleri
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Hangi para birimlerinde harcama yapıyor ve gelir elde ediyorsunuz?
      </Text>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Harcama Para Birimleri
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Harcamalarınızı hangi para birimlerinde yapıyorsunuz?
        </Text>
        
        <CurrencySelector
          selectedCurrency={expenseCurrencies[0]}
          onSelectCurrency={(currency) => setExpenseCurrencies([currency])}
          multiple={true}
          selectedCurrencies={expenseCurrencies}
          onToggleCurrency={(currency) => toggleCurrency(currency, 'expense')}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Gelir Para Birimleri
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Ek gelirlerinizi hangi para birimlerinde elde ediyorsunuz?
        </Text>
        
        <CurrencySelector
          selectedCurrency={incomeCurrencies[0]}
          onSelectCurrency={(currency) => setIncomeCurrencies([currency])}
          multiple={true}
          selectedCurrencies={incomeCurrencies}
          onToggleCurrency={(currency) => toggleCurrency(currency, 'income')}
        />
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Geri"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Kurulumu Tamamla"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    flex: 0.48,
  },
  nextButton: {
    flex: 0.48,
  },
});