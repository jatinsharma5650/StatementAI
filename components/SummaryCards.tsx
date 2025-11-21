import React from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from 'lucide-react';
import { AnalysisResult } from '../types';

interface SummaryCardsProps {
  data: AnalysisResult['summary'];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Income */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className="p-3 bg-green-100 rounded-lg text-green-600">
          <ArrowUpRight className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Credits</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalIncome)}</h3>
        </div>
      </div>

      {/* Expense */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className="p-3 bg-red-100 rounded-lg text-red-600">
          <ArrowDownRight className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Debits</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalExpense)}</h3>
        </div>
      </div>

      {/* Net */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${data.net >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
          {data.net >= 0 ? <Wallet className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Net Flow</p>
          <h3 className={`text-2xl font-bold ${data.net >= 0 ? 'text-gray-900' : 'text-orange-600'}`}>
            {formatCurrency(data.net)}
          </h3>
        </div>
      </div>
    </div>
  );
};