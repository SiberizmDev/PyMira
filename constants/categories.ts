import { Category } from '@/types';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Yiyecek & İçecek', icon: 'utensils', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Ulaşım', icon: 'car', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Alışveriş', icon: 'shopping-bag', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Eğlence', icon: 'film', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Sağlık', icon: 'heart', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Eğitim', icon: 'book', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Kira & Faturalar', icon: 'home', color: '#98D8C8', type: 'expense' },
  { id: '8', name: 'Giyim', icon: 'shirt', color: '#F7DC6F', type: 'expense' },
  { id: '9', name: 'Teknoloji', icon: 'smartphone', color: '#BB8FCE', type: 'expense' },
  { id: '10', name: 'Diğer', icon: 'more-horizontal', color: '#AED6F1', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: '11', name: 'Maaş', icon: 'banknote', color: '#52C41A', type: 'income' },
  { id: '12', name: 'Freelance', icon: 'briefcase', color: '#1890FF', type: 'income' },
  { id: '13', name: 'Yatırım', icon: 'trending-up', color: '#722ED1', type: 'income' },
  { id: '14', name: 'Bonus', icon: 'gift', color: '#FA8C16', type: 'income' },
  { id: '15', name: 'Diğer Gelir', icon: 'plus-circle', color: '#13C2C2', type: 'income' },
];

export const ALL_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];