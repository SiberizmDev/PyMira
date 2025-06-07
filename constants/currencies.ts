import { Currency } from '@/types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺', rate: 1 },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$', rate: 34.5 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 36.8 },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£', rate: 43.2 },
  { code: 'CHF', name: 'İsviçre Frangı', symbol: 'CHF', rate: 38.1 },
  { code: 'CAD', name: 'Kanada Doları', symbol: 'C$', rate: 24.3 },
  { code: 'AUD', name: 'Avustralya Doları', symbol: 'A$', rate: 21.8 },
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥', rate: 0.23 },
];

export const DEFAULT_CURRENCY = 'TRY';