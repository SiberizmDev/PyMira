import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
}

const STORAGE_KEY = '@transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        const withDates = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(withDates);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const transaction = {
        ...newTransaction,
        id: Date.now().toString(),
      };
      
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, updatedData: Omit<Transaction, 'id'>) => {
    try {
      const updatedTransactions = transactions.map(t => 
        t.id === id ? { ...updatedData, id } : t
      );
      
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
} 