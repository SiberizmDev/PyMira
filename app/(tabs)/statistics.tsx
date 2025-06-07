import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Target } from 'lucide-react-native';

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { monthlyStats } = useAppContext();

  const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`;
  };

  if (!monthlyStats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Aylık Özet
        </Text>
        <Card style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Bu ay henüz işlem bulunmuyor
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Aylık Özet
      </Text>

      {/* Gelir Kartı */}
      <Card style={styles.summaryCard}>
        <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
          <TrendingUp size={24} color={colors.success} />
        </View>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          Toplam Gelir
        </Text>
        <Text style={[styles.summaryAmount, { color: colors.success }]}>
          {formatCurrency(monthlyStats.totalIncome)}
        </Text>
      </Card>

      {/* Gider Kartı */}
      <Card style={styles.summaryCard}>
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <TrendingDown size={24} color={colors.error} />
        </View>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          Toplam Gider
        </Text>
        <Text style={[styles.summaryAmount, { color: colors.error }]}>
          {formatCurrency(monthlyStats.totalExpenses)}
        </Text>
      </Card>

      {/* Birikim Kartı */}
      <Card style={[styles.savingsCard, { backgroundColor: colors.primary + '10' }]}>
        <View style={styles.savingsContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Target size={24} color={colors.primary} />
          </View>
          <Text style={[styles.savingsAmount, { color: colors.primary }]}>
            {formatCurrency(monthlyStats.savings)}
          </Text>
          <Text style={[styles.savingsRate, { color: colors.textSecondary }]}>
            Oran: %{monthlyStats.savingsRate.toFixed(1)}
          </Text>
        </View>
      </Card>

      {/* Kategori Harcamaları */}
      <Card style={styles.categoriesCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          En Çok Harcama Yapılan Kategoriler
        </Text>
        {monthlyStats.topCategories.map((category, index) => (
          <View key={index} style={styles.categoryRow}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {category.category}
            </Text>
            <View style={styles.categoryDetails}>
              <Text style={[styles.categoryAmount, { color: colors.text }]}>
                {formatCurrency(category.amount)}
              </Text>
              <View style={styles.percentageContainer}>
                <View 
                  style={[
                    styles.percentageBar, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${category.percentage}%`,
                    }
                  ]} 
                />
                <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
                  %{category.percentage.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  savingsCard: {
    marginBottom: 24,
    padding: 20,
  },
  savingsContent: {
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  savingsRate: {
    fontSize: 16,
  },
  categoriesCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 8,
  },
  categoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  percentageContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  percentageText: {
    fontSize: 14,
    width: 60,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});