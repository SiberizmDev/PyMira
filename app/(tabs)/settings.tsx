import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { Theme } from '@/types';
import { 
  Sun, 
  Moon, 
  Smartphone, 
  Palette, 
  User, 
  DollarSign, 
  RefreshCw, 
  Settings as SettingsIcon 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { userProfile, refreshCurrencyRates } = useAppContext();

  const themeOptions: { key: Theme; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Açık Tema', icon: <Sun size={20} color={colors.text} /> },
    { key: 'dark', label: 'Koyu Tema', icon: <Moon size={20} color={colors.text} /> },
    { key: 'amoled', label: 'AMOLED Siyah', icon: <Smartphone size={20} color={colors.text} /> },
    { key: 'system', label: 'Sistem Teması', icon: <Palette size={20} color={colors.text} /> },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleEditProfile = () => {
    // Navigate to profile edit screen
    router.push('/setup');
  };

  const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Ayarlar
        </Text>
      </View>

      {/* Profile Section */}
      {userProfile && (
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <User size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Profil Bilgileri
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                Aylık Maaş:
              </Text>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {formatCurrency(userProfile.salaryInfo.amount, userProfile.salaryInfo.currency)}
              </Text>
            </View>
            
            <View style={styles.profileRow}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                Maaş Yatma Tarihi:
              </Text>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {userProfile.salaryInfo.paymentStartDay} - {userProfile.salaryInfo.paymentEndDay}
              </Text>
            </View>
            
            <View style={styles.profileRow}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                Harcama Para Birimleri:
              </Text>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {userProfile.expenseCurrencies.join(', ')}
              </Text>
            </View>
          </View>
          
          <Button
            title="Profil Düzenle"
            onPress={handleEditProfile}
            variant="outline"
            style={styles.editButton}
          />
        </Card>
      )}

      {/* Theme Section */}
      <Card style={styles.themeCard}>
        <View style={styles.sectionHeader}>
          <Palette size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tema Ayarları
          </Text>
        </View>
        
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.themeOption,
                {
                  backgroundColor: theme === option.key ? colors.primary + '20' : 'transparent',
                  borderColor: theme === option.key ? colors.primary : colors.border,
                }
              ]}
              onPress={() => handleThemeChange(option.key)}
            >
              <View style={styles.themeOptionContent}>
                {option.icon}
                <Text style={[
                  styles.themeOptionText,
                  {
                    color: theme === option.key ? colors.primary : colors.text,
                    fontWeight: theme === option.key ? '600' : '400',
                  }
                ]}>
                  {option.label}
                </Text>
              </View>
              {theme === option.key && (
                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Currency Section */}
      <Card style={styles.currencyCard}>
        <View style={styles.sectionHeader}>
          <DollarSign size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Döviz Kurları
          </Text>
        </View>
        
        <Text style={[styles.currencyInfo, { color: colors.textSecondary }]}>
          Döviz kurları otomatik olarak güncellenir
        </Text>
        
        <Button
          title="Kurları Yenile"
          onPress={refreshCurrencyRates}
          variant="outline"
          style={styles.refreshButton}
        />
      </Card>

      {/* App Info */}
      <Card style={styles.appInfoCard}>
        <View style={styles.sectionHeader}>
          <SettingsIcon size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Uygulama Hakkında
          </Text>
        </View>
        
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            Para Yöneticisi v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            Akıllı finansal yönetim uygulaması
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 100, // Tab bar için boşluk
  },
  header: {
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 16,
    flex: 1,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  editButton: {
    marginTop: 8,
  },
  themeCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeOptions: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currencyCard: {
    marginBottom: 20,
  },
  currencyInfo: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  refreshButton: {
    alignSelf: 'flex-start',
  },
  appInfoCard: {
    marginBottom: 40,
  },
  appInfo: {
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});