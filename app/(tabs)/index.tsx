import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Banknote, Calendar } from 'lucide-react-native';
import { AttendanceModal } from '@/components/AttendanceModal';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Transaction } from '@/types';
import { ALL_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/categories';
import * as Icon from 'lucide-react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { 
    userProfile, 
    monthlyStats, 
    budgetAdvice, 
    isLoading, 
    lastSalaryDate, 
    markSalaryAsReceived,
    showAttendanceModal,
    setShowAttendanceModal,
    handleAttendanceSave,
    addTransaction
  } = useAppContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'TRY',
    category: '',
    description: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = transactionType === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
  const availableCurrencies = transactionType === 'expense' 
    ? userProfile?.expenseCurrencies || ['TRY']
    : userProfile?.incomeCurrencies || ['TRY'];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Geçerli bir tutar girin';
    }

    if (!formData.category) {
      newErrors.category = 'Bir kategori seçin';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const transaction: Omit<Transaction, 'id'> = {
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      description: formData.description.trim(),
      date: new Date(),
      type: transactionType,
    };

    await addTransaction(transaction);
    setModalVisible(false);
    setFormData({
      amount: '',
      currency: 'TRY',
      category: '',
      description: '',
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = (Icon as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())];
    return IconComponent || Icon.Circle;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userProfile) {
    return null;
  }

  const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`;
  };

  const getSalaryStatus = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const dayOfMonth = today.getDate();
    const { paymentStartDay, paymentEndDay, possibleDelayDays } = userProfile.salaryInfo;

    if (lastSalaryDate && lastSalaryDate.getMonth() === currentMonth) {
      return { status: 'received', message: 'Maaş yattı' };
    }
    
    if (dayOfMonth >= paymentStartDay && dayOfMonth <= paymentEndDay) {
      return { status: 'due', message: 'Maaş yatma zamanı!' };
    } else if (dayOfMonth > paymentEndDay && dayOfMonth <= paymentEndDay + possibleDelayDays) {
      return { status: 'delayed', message: 'Maaş gecikmede olabilir' };
    } else if (dayOfMonth > paymentEndDay + possibleDelayDays) {
      return { status: 'overdue', message: 'Maaş gecikmiş' };
    } else {
      const daysLeft = paymentStartDay - dayOfMonth;
      return { status: 'waiting', message: `Maaşa ${daysLeft} gün kaldı` };
    }
  };

  const getNextSalaryInfo = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextPaymentDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), userProfile.salaryInfo.paymentStartDay);
    const daysUntilNextSalary = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `Gelecek maaşa ${daysUntilNextSalary} gün kaldı`;
  };

  const salaryStatus = getSalaryStatus();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Merhaba! 👋
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Salary Status */}
      <Card style={styles.salaryCard}>
        <View style={styles.salaryHeader}>
          <Banknote size={24} color={colors.primary} />
          <Text style={[styles.salaryTitle, { color: colors.text }]}>
            Maaş Durumu
          </Text>
        </View>
        <Text style={[styles.salaryAmount, { color: colors.text }]}>
          {formatCurrency(userProfile.salaryInfo.amount, userProfile.salaryInfo.currency)}
        </Text>
        {userProfile.salaryInfo.nextMonthEstimate !== undefined && (
          <>
            <Text style={[styles.estimatedSalary, { color: colors.textSecondary }]}>
              Gelecek Ay Tahmini: {formatCurrency(userProfile.salaryInfo.nextMonthEstimate, userProfile.salaryInfo.currency)}
            </Text>
            <Text style={[styles.estimatedSalary, { color: colors.textSecondary }]}>
              {getNextSalaryInfo()}
            </Text>
          </>
        )}
        <Text style={[
          styles.salaryStatus, 
          { 
            color: salaryStatus.status === 'received' ? colors.success :
                   salaryStatus.status === 'due' ? colors.success : 
                   salaryStatus.status === 'delayed' ? colors.warning : 
                   salaryStatus.status === 'overdue' ? colors.error : colors.textSecondary
          }
        ]}>
          {salaryStatus.message}
        </Text>
        {userProfile.salaryInfo.absences && userProfile.salaryInfo.absences.length > 0 && (
          <TouchableOpacity
            style={[styles.absenceButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => setShowAttendanceModal(true)}
          >
            <Calendar size={16} color={colors.primary} />
            <Text style={[styles.absenceButtonText, { color: colors.primary }]}>
              {userProfile.salaryInfo.absences.length} Gün Devamsızlık
            </Text>
          </TouchableOpacity>
        )}
        {(salaryStatus.status === 'due' || salaryStatus.status === 'delayed') && (
          <TouchableOpacity
            style={[styles.salaryButton, { backgroundColor: colors.success + '20' }]}
            onPress={markSalaryAsReceived}
          >
            <Text style={[styles.salaryButtonText, { color: colors.success }]}>
              Maaşım Yattı
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Monthly Overview */}
      {monthlyStats && (
        <View style={styles.overviewGrid}>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <TrendingUp size={20} color={colors.success} />
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                Gelir
              </Text>
            </View>
            <Text style={[styles.overviewAmount, { color: colors.text }]}>
              {formatCurrency(monthlyStats.totalIncome)}
            </Text>
          </Card>

          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <TrendingDown size={20} color={colors.error} />
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                Gider
              </Text>
            </View>
            <Text style={[styles.overviewAmount, { color: colors.text }]}>
              {formatCurrency(monthlyStats.totalExpenses)}
            </Text>
          </Card>

          <Card style={[styles.overviewCard, styles.savingsCard]}>
            <View style={styles.overviewHeader}>
              <Wallet size={20} color={colors.primary} />
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                Birikim
              </Text>
            </View>
            <Text style={[styles.overviewAmount, { color: colors.text }]}>
              {formatCurrency(monthlyStats.savings)}
            </Text>
            <Text style={[styles.savingsRate, { color: colors.textSecondary }]}>
              %{monthlyStats.savingsRate.toFixed(1)}
            </Text>
          </Card>
        </View>
      )}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Hızlı İşlemler
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
            onPress={() => {
              setTransactionType('expense');
              setFormData({
                amount: '',
                currency: userProfile?.expenseCurrencies?.[0] || 'TRY',
                category: DEFAULT_EXPENSE_CATEGORIES[0]?.id || '',
                description: '',
              });
              setErrors({});
              setModalVisible(true);
            }}
          >
            <TrendingDown size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              Harcama Ekle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
            onPress={() => {
              setTransactionType('income');
              setFormData({
                amount: '',
                currency: userProfile?.incomeCurrencies?.[0] || 'TRY',
                category: DEFAULT_INCOME_CATEGORIES[0]?.id || '',
                description: '',
              });
              setErrors({});
              setModalVisible(true);
            }}
          >
            <TrendingUp size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>
              Gelir Ekle
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Budget Advice */}
      {budgetAdvice.length > 0 && (
        <Card style={styles.adviceCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Öneriler
          </Text>
          {budgetAdvice.slice(0, 2).map((advice, index) => (
            <View key={index} style={styles.adviceItem}>
              <AlertCircle 
                size={20} 
                color={advice.type === 'warning' ? colors.warning : 
                       advice.type === 'savings' ? colors.success : colors.info} 
              />
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceTitle, { color: colors.text }]}>
                  {advice.title}
                </Text>
                <Text style={[styles.adviceDescription, { color: colors.textSecondary }]}>
                  {advice.description}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      <AttendanceModal
        visible={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSave={handleAttendanceSave}
        currentAbsences={userProfile?.salaryInfo.absences || []}
        month={new Date().getMonth()}
        year={new Date().getFullYear()}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {transactionType === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
          </Text>

          <Input
            label="Tutar"
            value={formData.amount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
            keyboardType="numeric"
            placeholder="0"
            error={errors.amount}
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Para Birimi</Text>
          <CurrencySelector
            selectedCurrency={formData.currency}
            onSelectCurrency={(currency) => setFormData(prev => ({ ...prev, currency }))}
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              const isSelected = category.id === formData.category;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected ? category.color + '20' : 'transparent',
                      borderColor: isSelected ? category.color : colors.border,
                    }
                  ]}
                >
                  <CategoryIcon size={20} color={category.color} />
                  <Text style={[
                    styles.categoryButtonText,
                    { color: isSelected ? category.color : colors.text }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.category && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.category}</Text>
          )}

          <Input
            label="Açıklama"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="İşlem açıklaması"
            error={errors.description}
          />

          <View style={styles.modalButtons}>
            <Button
              title="İptal"
              onPress={() => setModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Kaydet"
              onPress={handleSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
  },
  salaryCard: {
    marginBottom: 20,
  },
  salaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  salaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  salaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  salaryStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  salaryButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  salaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewCard: {
    width: '48%',
    marginBottom: 12,
  },
  savingsCard: {
    width: '100%',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  overviewAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  savingsRate: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  adviceCard: {
    marginBottom: 20,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  adviceContent: {
    flex: 1,
    marginLeft: 12,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  estimatedSalary: {
    fontSize: 14,
    marginTop: 4,
  },
  absenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  absenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 120,
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});