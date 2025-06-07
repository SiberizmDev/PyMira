import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Transaction, Currency, BudgetAdvice, MonthlyStats, Attendance } from '@/types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';
import { ALL_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/categories';
import { View, Text } from 'react-native';

export type Category = {
  id: string;
  name: string;
  icon: string;
  emoji?: string;
  color: string;
  type: 'income' | 'expense';
};

interface AppContextType {
  userProfile: UserProfile | null;
  transactions: Transaction[];
  currencies: Currency[];
  monthlyStats: MonthlyStats | null;
  budgetAdvice: BudgetAdvice[];
  isLoading: boolean;
  lastSalaryDate: Date | null;
  showAttendanceModal: boolean;
  showTransactionsModal: boolean;
  expenseCategories: Category[];
  incomeCategories: Category[];
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshCurrencyRates: () => Promise<void>;
  calculateMonthlyStats: () => MonthlyStats;
  generateBudgetAdvice: () => BudgetAdvice[];
  markSalaryAsReceived: () => void;
  handleAttendanceSave: (absences: Attendance[]) => void;
  setShowAttendanceModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTransactionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  hasCompletedSetup: boolean;
  setHasCompletedSetup: (value: boolean) => void;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  TRANSACTIONS: '@transactions',
  SETUP_COMPLETED: '@setup_completed',
  LAST_SALARY_DATE: '@last_salary_date',
  ATTENDANCE_DATA: '@attendance_data',
  EXPENSE_CATEGORIES: '@expense_categories',
  INCOME_CATEGORIES: '@income_categories',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(SUPPORTED_CURRENCIES.map(c => ({ ...c, rate: 1 })));
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [budgetAdvice, setBudgetAdvice] = useState<BudgetAdvice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSalaryDate, setLastSalaryDate] = useState<Date | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetupState] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(DEFAULT_INCOME_CATEGORIES);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await loadSavedData();
        await loadCategories();
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(new Error('Uygulama başlatılamadı: ' + (err?.message || '')));
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading && userProfile) {
      const stats = calculateMonthlyStats();
      setMonthlyStats(stats);
      setBudgetAdvice(generateBudgetAdvice());
    }
  }, [userProfile, transactions, isLoading]);

  const loadSavedData = async () => {
    try {
      console.log('Loading saved data...');
      
      const [profileData, transactionsData, setupCompleted, lastSalaryDateStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETED),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SALARY_DATE),
      ]);

      if (profileData) {
        try {
          const parsedProfile = JSON.parse(profileData);
          setUserProfileState(parsedProfile);
        } catch (err) {
          console.error('Error parsing profile data:', err);
          setUserProfileState(null);
        }
      }

      if (transactionsData) {
        try {
          const parsedTransactions = JSON.parse(transactionsData);
          const transactionsWithDates = parsedTransactions.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }));
          setTransactions(transactionsWithDates);
        } catch (err) {
          console.error('Error parsing transactions:', err);
          setTransactions([]);
        }
      }

      if (setupCompleted) {
        try {
          const parsed = JSON.parse(setupCompleted);
          setHasCompletedSetupState(!!parsed); // Convert to boolean
        } catch (err) {
          console.error('Error parsing setup status:', err);
          setHasCompletedSetupState(false);
        }
      } else {
        // Eğer setupCompleted null ise, false olarak ayarla
        setHasCompletedSetupState(false);
      }

      if (lastSalaryDateStr) {
        try {
          const date = new Date(JSON.parse(lastSalaryDateStr));
          setLastSalaryDate(isNaN(date.getTime()) ? null : date);
        } catch (err) {
          console.error('Error parsing last salary date:', err);
          setLastSalaryDate(null);
        }
      }
    } catch (err) {
      console.error('Error in loadSavedData:', err);
      throw new Error('Veriler yüklenemedi: ' + (err?.message || ''));
    }
  };

  const loadCategories = async () => {
    try {
      const storedExpenseCategories = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
      const storedIncomeCategories = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES);

      if (storedExpenseCategories) {
        setExpenseCategories(JSON.parse(storedExpenseCategories));
      }
      if (storedIncomeCategories) {
        setIncomeCategories(JSON.parse(storedIncomeCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const setUserProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      setUserProfileState(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const setHasCompletedSetup = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETED, JSON.stringify(value));
      setHasCompletedSetupState(value);
    } catch (error) {
      console.error('Error saving setup status:', error);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = {
        ...transactionData,
        id: Date.now().toString(),
      };

      const updatedTransactions = [...transactions, newTransaction];
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    try {
      const updatedTransactions = transactions.map(t => 
        t.id === id ? { ...transactionData, id } : t
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const refreshCurrencyRates = async () => {
    try {
      // Use default static rates instead of API
      const updatedCurrencies = SUPPORTED_CURRENCIES.map(currency => ({
        ...currency,
        rate: 1 // Sabit rate kullan
      }));
      setCurrencies(updatedCurrencies);
    } catch (error) {
      console.error('Error updating currencies:', error);
    }
  };

  const calculateMonthlyStats = (): MonthlyStats => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertToTRY(t.amount, t.currency), 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertToTRY(t.amount, t.currency), 0);

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Calculate top expense categories
    const categoryTotals: { [key: string]: number } = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const amount = convertToTRY(t.amount, t.currency);
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: ALL_CATEGORIES.find(c => c.id === category)?.name || 'Bilinmeyen',
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      topCategories,
    };
  };

  const generateBudgetAdvice = (): BudgetAdvice[] => {
    if (!monthlyStats || !userProfile) return [];

    const advice: BudgetAdvice[] = [];
    const { totalIncome, totalExpenses, savings, savingsRate } = monthlyStats;

    // Savings rate advice
    if (savingsRate < 10) {
      advice.push({
        type: 'warning',
        title: 'Birikim Oranı Düşük',
        description: 'Aylık gelirinizin en az %10\'unu biriktirmeye çalışın. Harcamalarınızı gözden geçirebilirsiniz.',
        amount: totalIncome * 0.1,
        currency: 'TRY',
      });
    } else if (savingsRate >= 20) {
      advice.push({
        type: 'savings',
        title: 'Harika Birikim!',
        description: `Aylık gelirinizin %${savingsRate.toFixed(1)}\'ini biriktiriyorsunuz. Bu başarıyı sürdürün!`,
      });
    }

    // Salary delay warning
    const today = new Date();
    const dayOfMonth = today.getDate();
    const { paymentEndDay, possibleDelayDays } = userProfile.salaryInfo;
    
    if (dayOfMonth > paymentEndDay && dayOfMonth <= paymentEndDay + possibleDelayDays) {
      advice.push({
        type: 'info',
        title: 'Maaş Gecikmesi Uyarısı',
        description: 'Maaş yatma tarihiniz geçti. Harcamalarınızı kontrol altında tutun.',
      });
    }

    // High expense category warning
    if (monthlyStats.topCategories.length > 0) {
      const topCategory = monthlyStats.topCategories[0];
      if (topCategory.percentage > 40) {
        advice.push({
          type: 'warning',
          title: 'Yüksek Kategori Harcaması',
          description: `${topCategory.category} kategorisinde aylık harcamanızın %${topCategory.percentage.toFixed(1)}\'ini yapıyorsunuz.`,
          amount: topCategory.amount,
          currency: 'TRY',
        });
      }
    }

    return advice;
  };

  const convertToTRY = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === 'TRY') return amount;
    const currency = currencies.find(c => c.code === fromCurrency);
    return currency ? amount * currency.rate : amount;
  };

  const calculateDailyRate = (salary: number, workingDays: number = 22) => {
    return salary / workingDays;
  };

  const calculateNextMonthSalary = (absences: Attendance[]) => {
    if (!userProfile) return;

    const { amount, workingDaysPerMonth = 22 } = userProfile.salaryInfo;
    const dailyRate = calculateDailyRate(amount, workingDaysPerMonth);
    const deduction = dailyRate * absences.length;
    const nextMonthEstimate = amount - deduction;

    // Profili güncelle
    const updatedProfile = {
      ...userProfile,
      salaryInfo: {
        ...userProfile.salaryInfo,
        absences,
        dailyRate,
        nextMonthEstimate,
        workingDaysPerMonth
      }
    };

    setUserProfile(updatedProfile);
    return nextMonthEstimate;
  };

  const markSalaryAsReceived = async () => {
    const currentDate = new Date();
    setLastSalaryDate(currentDate);
    setShowAttendanceModal(true);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SALARY_DATE, JSON.stringify(currentDate));
      
      // Maaş tutarını gelir olarak ekle
      if (userProfile) {
        const salaryTransaction: Omit<Transaction, 'id'> = {
          amount: userProfile.salaryInfo.amount,
          currency: userProfile.salaryInfo.currency,
          category: '11', // Maaş kategorisi ID'si
          description: 'Aylık Maaş',
          date: currentDate,
          type: 'income',
        };
        await addTransaction(salaryTransaction);
      }
    } catch (error) {
      console.error('Error saving salary date:', error);
    }
  };

  const handleAttendanceSave = async (absences: Attendance[]) => {
    const nextMonthEstimate = calculateNextMonthSalary(absences);
    setShowAttendanceModal(false);

    if (userProfile) {
      try {
        const updatedProfile = {
          ...userProfile,
          salaryInfo: {
            ...userProfile.salaryInfo,
            absences,
            nextMonthEstimate,
          }
        };
        await setUserProfile(updatedProfile);
      } catch (error) {
        console.error('Error saving attendance data:', error);
      }
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = {
        ...category,
        id: Date.now().toString(),
      };

      if (category.type === 'expense') {
        const updatedCategories = [...expenseCategories, newCategory];
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(updatedCategories));
        setExpenseCategories(updatedCategories);
      } else {
        const updatedCategories = [...incomeCategories, newCategory];
        await AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(updatedCategories));
        setIncomeCategories(updatedCategories);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    try {
      const isExpense = expenseCategories.some(c => c.id === id);
      const categories = isExpense ? expenseCategories : incomeCategories;
      const storageKey = isExpense ? STORAGE_KEYS.EXPENSE_CATEGORIES : STORAGE_KEYS.INCOME_CATEGORIES;
      const setCategories = isExpense ? setExpenseCategories : setIncomeCategories;

      const updatedCategories = categories.map(c => 
        c.id === id ? { ...c, ...categoryUpdate } : c
      );

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const isExpense = expenseCategories.some(c => c.id === id);
      const categories = isExpense ? expenseCategories : incomeCategories;
      const storageKey = isExpense ? STORAGE_KEYS.EXPENSE_CATEGORIES : STORAGE_KEYS.INCOME_CATEGORIES;
      const setCategories = isExpense ? setExpenseCategories : setIncomeCategories;

      // Prevent deleting if it's the last category
      if (categories.length <= 1) {
        throw new Error('En az bir kategori bulunmalıdır');
      }

      const updatedCategories = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  if (error) {
  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Bir Hata Oluştu</Text>
        <Text style={{ textAlign: 'center', padding: 20 }}>
          {error.message || 'Bilinmeyen bir hata oluştu'}
        </Text>
      </View>
    );
  }

  const contextValue = {
      userProfile,
      transactions,
      currencies,
      monthlyStats,
      budgetAdvice,
      isLoading,
      lastSalaryDate,
      showAttendanceModal,
      showTransactionsModal,
      expenseCategories,
      incomeCategories,
      updateUserProfile: setUserProfile,
      addTransaction,
      deleteTransaction,
      refreshCurrencyRates,
      calculateMonthlyStats,
      generateBudgetAdvice,
      markSalaryAsReceived,
      handleAttendanceSave,
      setShowAttendanceModal,
      setShowTransactionsModal,
      hasCompletedSetup,
      setHasCompletedSetup,
      addCategory,
      updateCategory,
      deleteCategory,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}