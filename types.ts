export enum TransactionType {
  CREDIT = 'Credit',
  DEBIT = 'Debit',
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  notes: string;
}

export interface AnalysisResult {
  transactions: Transaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
}

export type ProcessingStatus = 'idle' | 'converting' | 'analyzing' | 'complete' | 'error';

// Add window type extension for pdfjsLib injected via CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}