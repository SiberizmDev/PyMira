import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { ALL_CATEGORIES } from '@/constants/categories';
import { Trash2 } from 'lucide-react-native';
import * as Icon from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useAppContext();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === 'expense' && 
           transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);

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

  const renderExpenseItem = ({ item }: { item: typeof monthlyExpenses[0] }) => {
    const category = getCategoryInfo(item.category);
    const IconComponent = getCategoryIcon(category.icon);

    return (
      <Card style={styles.expenseItem}>
        <View style={styles.expenseContent}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <IconComponent size={24} color={category.color} />
          </View>
          
          <View style={styles.expenseDetails}>
            <Text style={[styles.expenseDescription, { color: colors.text }]}>
              {item.description}
            </Text>
            <Text style={[styles.expenseCategory, { color: colors.textSecondary }]}>
              {category.name} • {formatDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.expenseRight}>
            <Text style={[styles.expenseAmount, { color: colors.error }]}>
              -{formatCurrency(item.amount, item.currency)}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTransaction(item.id)}
            >
              <Trash2 size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Harcamalar
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Bu ayın harcamaları
        </Text>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          Toplam Harcama
        </Text>
        <Text style={[styles.summaryAmount, { color: colors.error }]}>
          {formatCurrency(totalExpenses)}
        </Text>
        <Text style={[styles.transactionCount, { color: colors.textSecondary }]}>
          {monthlyExpenses.length} işlem
        </Text>
      </Card>

      {monthlyExpenses.length > 0 ? (
        <FlatList
          data={monthlyExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
        />
      ) : (
        <Card style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Bu ay henüz harcama kaydınız yok
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            İşlemler sekmesinden harcama ekleyebilirsiniz
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  summaryCard: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 24,
  },
  summaryLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionCount: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  expenseItem: {
    marginBottom: 12,
    padding: 16,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});