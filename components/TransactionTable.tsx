import React, { useState } from 'react';
import { Download, Search, ArrowUpCircle, ArrowDownCircle, ListFilter } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Credit' | 'Debit'>('All');

  const filteredData = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : t.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Calculate dynamic totals based on filtered view
  const totalIncome = filteredData.reduce((sum, t) => (t.amount > 0 ? sum + t.amount : sum), 0);
  const totalExpense = filteredData.reduce((sum, t) => (t.amount < 0 ? sum + Math.abs(t.amount) : sum), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Notes'];
    // Export only the filtered data to match the user's current view
    const rows = filteredData.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.amount.toFixed(2),
      t.type,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div className="flex space-x-2">
             {(['All', 'Credit', 'Debit'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === f 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
             ))}
          </div>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Dynamic Filter Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-gray-50 border-b border-gray-200">
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center text-gray-500 mb-1">
                <ListFilter className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase tracking-wider">Showing Transactions</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{filteredData.length}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center text-green-600 mb-1">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Income</span>
            </div>
            <span className="text-xl font-bold text-green-700">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center text-red-600 mb-1">
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Spending</span>
            </div>
            <span className="text-xl font-bold text-red-700">{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{t.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{t.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium ${
                    t.amount > 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.type === TransactionType.CREDIT 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{t.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};