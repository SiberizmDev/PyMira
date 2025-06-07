export type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate: number;
};

export type Theme = 'light' | 'dark' | 'amoled' | 'system';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
};

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
  type: 'expense' | 'income';
};

export interface Attendance {
  date: string; // ISO string format
  isAbsent: boolean;
  reason?: string;
}

export interface SalaryInfo {
  amount: number;
  currency: string;
  paymentStartDay: number;
  paymentEndDay: number;
  possibleDelayDays: number;
  dailyRate?: number; // Günlük maaş tutarı
  workingDaysPerMonth?: number; // Aylık çalışma günü sayısı (varsayılan: 22)
  absences: Attendance[]; // İşe gidilmeyen günler
  nextMonthEstimate?: number; // Sonraki ay tahmini maaş
}

export type UserProfile = {
  salaryInfo: SalaryInfo;
  expenseCurrencies: string[];
  incomeCurrencies: string[];
  setupCompleted: boolean;
};

export type BudgetAdvice = {
  type: 'savings' | 'warning' | 'info';
  title: string;
  description: string;
  amount?: number;
  currency?: string;
};

export type MonthlyStats = {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  topCategories: { category: string; amount: number; percentage: number }[];
};