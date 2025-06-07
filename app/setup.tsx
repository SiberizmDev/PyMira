import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { WelcomeStep } from '@/components/setup/WelcomeStep';
import { SalaryStep } from '@/components/setup/SalaryStep';
import { CurrencyStep } from '@/components/setup/CurrencyStep';
import { SalaryInfo, UserProfile } from '@/types';
import { DEFAULT_CURRENCY } from '@/constants/currencies';

export default function SetupScreen() {
  const { colors } = useTheme();
  const { updateUserProfile, setHasCompletedSetup } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo | null>(null);

  const handleSalaryNext = (info: SalaryInfo) => {
    setSalaryInfo(info);
    setCurrentStep(2);
  };

  const handleCurrencyNext = async (expenseCurrencies: string[], incomeCurrencies: string[]) => {
    if (!salaryInfo) return;

    const userProfile: UserProfile = {
      salaryInfo,
      expenseCurrencies,
      incomeCurrencies,
      setupCompleted: true,
    };

    await updateUserProfile(userProfile);
    await setHasCompletedSetup(true);
    router.replace('/(tabs)');
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setCurrentStep(1)} />,
    <SalaryStep 
      key="salary" 
      onNext={handleSalaryNext}
      onBack={() => setCurrentStep(0)}
    />,
    <CurrencyStep 
      key="currency" 
      onNext={handleCurrencyNext}
      onBack={() => setCurrentStep(1)}
    />,
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {steps[currentStep]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});