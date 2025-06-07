import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { ChevronDown, Check } from 'lucide-react-native';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  multiple?: boolean;
  selectedCurrencies?: string[];
  onToggleCurrency?: (currency: string) => void;
}

export function CurrencySelector({ 
  selectedCurrency, 
  onSelectCurrency,
  multiple = false,
  selectedCurrencies = [],
  onToggleCurrency
}: CurrencySelectorProps) {
  const { colors } = useTheme();
  const { currencies } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const handleCurrencySelect = (currencyCode: string) => {
    if (multiple && onToggleCurrency) {
      onToggleCurrency(currencyCode);
    } else {
      onSelectCurrency(currencyCode);
      setModalVisible(false);
    }
  };

  const renderCurrency = ({ item }: { item: typeof currencies[0] }) => {
    const isSelected = multiple 
      ? selectedCurrencies.includes(item.code)
      : item.code === selectedCurrency;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          { 
            backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
            borderColor: colors.border,
          }
        ]}
        onPress={() => handleCurrencySelect(item.code)}
      >
        <View style={styles.currencyInfo}>
          <Text style={[styles.currencySymbol, { color: colors.text }]}>
            {item.symbol}
          </Text>
          <View style={styles.currencyDetails}>
            <Text style={[styles.currencyCode, { color: colors.text }]}>
              {item.code}
            </Text>
            <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
              {item.name}
            </Text>
          </View>
          <Text style={[styles.currencyRate, { color: colors.textSecondary }]}>
            {item.code === 'TRY' ? '1.00' : item.rate.toFixed(2)} ₺
          </Text>
        </View>
        
        {isSelected && (
          <Check size={20} color={colors.primary} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={[styles.selectorSymbol, { color: colors.text }]}>
            {selectedCurrencyData?.symbol}
          </Text>
          <View style={styles.selectorInfo}>
            <Text style={[styles.selectorCode, { color: colors.text }]}>
              {selectedCurrencyData?.code}
            </Text>
            <Text style={[styles.selectorName, { color: colors.textSecondary }]}>
              {selectedCurrencyData?.name}
            </Text>
          </View>
        </View>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {multiple && selectedCurrencies.length > 1 && (
        <View style={styles.selectedCurrencies}>
          {selectedCurrencies.map(code => {
            const currency = currencies.find(c => c.code === code);
            return (
              <View 
                key={code} 
                style={[styles.selectedTag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.selectedTagText, { color: colors.primary }]}>
                  {currency?.symbol} {currency?.code}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Para Birimi Seç
        </Text>
        
        <FlatList
          data={currencies}
          renderItem={renderCurrency}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          style={styles.currencyList}
        />

        {multiple && (
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>Tamam</Text>
          </TouchableOpacity>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  selectorInfo: {
    flex: 1,
  },
  selectorCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectorName: {
    fontSize: 14,
    marginTop: 2,
  },
  selectedCurrencies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  selectedTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  currencyRate: {
    fontSize: 14,
    marginRight: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
  doneButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});