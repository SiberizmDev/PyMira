import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from './ui/Card';
import { Transaction } from '@/types';
import { ALL_CATEGORIES } from '@/constants/categories';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { Button } from './ui/Button';

interface TransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TransactionsModal({ visible, onClose }: TransactionsModalProps) {
  const { colors } = useTheme();
  const { transactions } = useAppContext();

  const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`;
  };

  const renderTransaction = (transaction: Transaction) => {
    const category = ALL_CATEGORIES.find(c => c.id === transaction.category);
    const isIncome = transaction.type === 'income';

    return (
      <Card key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          {isIncome ? (
            <TrendingUp size={20} color={colors.success} />
          ) : (
            <TrendingDown size={20} color={colors.error} />
          )}
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionTitle, { color: colors.text }]}>
              {category?.name || 'Diğer'}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {new Date(transaction.date).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              { color: isIncome ? colors.success : colors.error },
            ]}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currency)}
          </Text>
        </View>
        {transaction.description && (
          <Text style={[styles.transactionDescription, { color: colors.textSecondary }]}>
            {transaction.description}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          İşlemler
        </Text>
        
        <View style={styles.content}>
          {transactions.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Henüz işlem bulunmuyor
              </Text>
            </Card>
          ) : (
            <View style={styles.transactionsList}>
              {transactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(renderTransaction)}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Button
              title="Harcama Ekle"
              onPress={() => {
                // TODO: Add expense functionality
              }}
              style={{ backgroundColor: colors.error }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Gelir Ekle"
              onPress={() => {
                // TODO: Add income functionality
              }}
              style={{ backgroundColor: colors.success }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  transactionsList: {
    gap: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  transactionCard: {
    marginBottom: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 32,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
}); 