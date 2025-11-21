import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { AnalysisResult } from '../types';

interface ChartSectionProps {
  transactions: AnalysisResult['transactions'];
}

export const ChartSection: React.FC<ChartSectionProps> = ({ transactions }) => {
  // Aggregate data by date
  const aggregatedData = transactions.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      if (curr.amount > 0) existing.income += curr.amount;
      else existing.expense += Math.abs(curr.amount);
      existing.balance += curr.amount;
    } else {
      acc.push({
        date: curr.date,
        income: curr.amount > 0 ? curr.amount : 0,
        expense: curr.amount < 0 ? Math.abs(curr.amount) : 0,
        balance: curr.amount
      });
    }
    return acc;
  }, [] as any[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate cumulative balance for area chart
  let runningBalance = 0;
  const balanceData = aggregatedData.map(d => {
    runningBalance += d.balance;
    return { ...d, cumulativeBalance: runningBalance };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cash Flow Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Cash Flow</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="income" name="Credit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Debit" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Balance Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                 formatter={(value: number) => [`$${value.toFixed(2)}`, 'Net Balance']}
                 labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativeBalance" 
                stroke="#6366f1" 
                fill="#e0e7ff" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};