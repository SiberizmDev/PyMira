import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencySelector } from '@/components/CurrencySelector';
import { SalaryInfo } from '@/types';
import { DEFAULT_CURRENCY } from '@/constants/currencies';

interface SalaryStepProps {
  onNext: (salaryInfo: SalaryInfo) => void;
  onBack: () => void;
}

export function SalaryStep({ onNext, onBack }: SalaryStepProps) {
  const { colors } = useTheme();
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo>({
    amount: 0,
    currency: DEFAULT_CURRENCY,
    paymentStartDay: 1,
    paymentEndDay: 5,
    possibleDelayDays: 3,
  });
  const [errors, setErrors] = useState<Partial<SalaryInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SalaryInfo> = {};

    if (!salaryInfo.amount || salaryInfo.amount <= 0) {
      newErrors.amount = 0;
    }

    if (salaryInfo.paymentStartDay < 1 || salaryInfo.paymentStartDay > 31) {
      newErrors.paymentStartDay = 0;
    }

    if (salaryInfo.paymentEndDay < 1 || salaryInfo.paymentEndDay > 31) {
      newErrors.paymentEndDay = 0;
    }

    if (salaryInfo.paymentEndDay < salaryInfo.paymentStartDay) {
      newErrors.paymentEndDay = 0;
    }

    if (salaryInfo.possibleDelayDays < 0 || salaryInfo.possibleDelayDays > 30) {
      newErrors.possibleDelayDays = 0;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(salaryInfo);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>
        Maaş Bilgileriniz
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Maaş bilgilerinizi girerek daha iyi finansal planlama yapabilirsiniz.
      </Text>

      <Card style={styles.card}>
        <Input
          label="Aylık Maaş Tutarı"
          value={salaryInfo.amount.toString()}
          onChangeText={(text) => setSalaryInfo(prev => ({ 
            ...prev, 
            amount: parseFloat(text) || 0 
          }))}
          keyboardType="numeric"
          placeholder="0"
          error={errors.amount !== undefined ? 'Geçerli bir tutar girin' : undefined}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Para Birimi
        </Text>
        <CurrencySelector
          selectedCurrency={salaryInfo.currency}
          onSelectCurrency={(currency) => setSalaryInfo(prev => ({ 
            ...prev, 
            currency 
          }))}
        />

        <View style={styles.dateSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Maaş Yatma Tarihi
          </Text>
          
          <View style={styles.dateRow}>
            <Input
              label="Başlangıç Günü"
              value={salaryInfo.paymentStartDay.toString()}
              onChangeText={(text) => setSalaryInfo(prev => ({ 
                ...prev, 
                paymentStartDay: parseInt(text) || 1 
              }))}
              keyboardType="numeric"
              placeholder="1"
              style={styles.dateInput}
              error={errors.paymentStartDay !== undefined ? 'Geçerli gün' : undefined}
            />
            
            <Input
              label="Bitiş Günü"
              value={salaryInfo.paymentEndDay.toString()}
              onChangeText={(text) => setSalaryInfo(prev => ({ 
                ...prev, 
                paymentEndDay: parseInt(text) || 5 
              }))}
              keyboardType="numeric"
              placeholder="5"
              style={styles.dateInput}
              error={errors.paymentEndDay !== undefined ? 'Geçerli gün' : undefined}
            />
          </View>
        </View>

        <Input
          label="Olası Gecikme (Gün)"
          value={salaryInfo.possibleDelayDays.toString()}
          onChangeText={(text) => setSalaryInfo(prev => ({ 
            ...prev, 
            possibleDelayDays: parseInt(text) || 0 
          }))}
          keyboardType="numeric"
          placeholder="3"
          error={errors.possibleDelayDays !== undefined ? 'Geçerli gün sayısı' : undefined}
        />

        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Maaşınız genellikle ayın {salaryInfo.paymentStartDay}. ve {salaryInfo.paymentEndDay}. günleri arasında yatıyor. 
          {salaryInfo.possibleDelayDays > 0 && ` ${salaryInfo.possibleDelayDays} güne kadar gecikme olabilir.`}
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Geri"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Devam Et"
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
    marginBottom: 12,
    marginTop: 8,
  },
  dateSection: {
    marginTop: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 0.48,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
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