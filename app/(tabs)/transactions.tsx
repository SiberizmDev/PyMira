import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Transaction } from '@/types';
import { ALL_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/categories';
import { Plus, Minus, Edit2, Trash2, ArrowDown, ArrowUp } from 'lucide-react-native';
import * as Icon from 'lucide-react-native';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { addTransaction, deleteTransaction, transactions, userProfile } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

  const openModal = (type: 'income' | 'expense', transaction?: Transaction) => {
    setTransactionType(type);
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        category: transaction.category,
        description: transaction.description,
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        amount: '',
        currency: availableCurrencies[0] || 'TRY',
        category: categories[0]?.id || '',
        description: '',
      });
    }
    setErrors({});
    setModalVisible(true);
  };

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
      date: editingTransaction ? editingTransaction.date : new Date(),
      type: transactionType,
    };

    if (editingTransaction) {
      // Update existing transaction
      await deleteTransaction(editingTransaction.id);
      await addTransaction({ ...transaction, id: editingTransaction.id });
    } else {
      // Add new transaction
      await addTransaction(transaction);
    }

    setModalVisible(false);
    setFormData({
      amount: '',
      currency: 'TRY',
      category: '',
      description: '',
    });
    setEditingTransaction(null);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'İşlemi Sil',
      'Bu işlemi silmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ],
    );
  };

  const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return ALL_CATEGORIES.find(c => c.id === categoryId) || {
      name: 'Bilinmeyen',
      icon: 'circle',
      color: colors.textSecondary,
    };
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = (Icon as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())];
    return IconComponent || Icon.Circle;
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          İşlemler
        </Text>
        <View style={styles.actionButtons}>
          <Button
            title="Gelir Ekle"
            onPress={() => openModal('income')}
            icon={<Plus size={20} color={colors.success} />}
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.success }]}
            textStyle={{ color: colors.success }}
          />
          <Button
            title="Gider Ekle"
            onPress={() => openModal('expense')}
            icon={<Minus size={20} color={colors.error} />}
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </View>

      <ScrollView style={styles.transactionList} showsVerticalScrollIndicator={false}>
        {sortedTransactions.map((transaction) => {
          const category = getCategoryInfo(transaction.category);
          const CategoryIcon = getCategoryIcon(category.icon);
          const isIncome = transaction.type === 'income';

          return (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <CategoryIcon size={20} color={category.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionDescription, { color: colors.text }]}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                      {category.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionActions}>
                  <TouchableOpacity
                    onPress={() => openModal(transaction.type, transaction)}
                    style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}
                  >
                    <Edit2 size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(transaction)}
                    style={[styles.actionIcon, { backgroundColor: colors.error + '20' }]}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.transactionFooter}>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {formatDate(transaction.date)}
                </Text>
                <View style={styles.amountContainer}>
                  {isIncome ? (
                    <ArrowUp size={16} color={colors.success} style={styles.amountIcon} />
                  ) : (
                    <ArrowDown size={16} color={colors.error} style={styles.amountIcon} />
                  )}
                  <Text style={[
                    styles.transactionAmount,
                    { color: isIncome ? colors.success : colors.error }
                  ]}>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingTransaction ? 'İşlemi Düzenle' : (transactionType === 'income' ? 'Gelir Ekle' : 'Gider Ekle')}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
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
              title={editingTransaction ? 'Güncelle' : 'Kaydet'}
              onPress={handleSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  transactionList: {
    flex: 1,
    marginBottom: 80,
    borderRadius: 10,
    overflow: 'hidden',
  },
  transactionCard: {
    marginBottom: 12,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountIcon: {
    marginRight: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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