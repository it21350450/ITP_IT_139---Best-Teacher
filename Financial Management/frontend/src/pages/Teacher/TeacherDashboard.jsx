import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { TrendingUp, Wallet, Clock, ArrowUpRight, CheckCircle, XCircle, Edit, Trash2, DollarSign, CreditCard, Send, History } from 'lucide-react';
import { format } from 'date-fns';

const TeacherDashboard = () => {
  // Main data state including earnings history and wallet balances
  const [data, setData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayoutAmount: 0,
    transactions: []
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [editingPayout, setEditingPayout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validation error states for payout requests
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch teacher financial data from the backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [earningsRes, historyRes] = await Promise.all([
        api.get('/teacher/earnings'),
        api.get('/teacher/payout/history')
      ]);
      setData(earningsRes.data);
      setPayoutHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle new payout/withdrawal request
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    // Validation: check for valid number and sufficient balance
    if (!withdrawalAmount || isNaN(withdrawalAmount) || Number(withdrawalAmount) <= 0) {
      setErrors({ amount: 'Enter a valid amount > 0' });
      return;
    }
    if (Number(withdrawalAmount) > data.availableBalance) {
      setErrors({ amount: 'Amount exceeds available balance' });
      return;
    }

    try {
      setErrors({});
      await api.post('/teacher/payout/request', { amount: Number(withdrawalAmount), method: 'demo' });
      alert('Withdrawal request submitted!');
      setWithdrawalAmount('');
      fetchData(); // Refresh wallet data
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    }
  };

  const handleUpdatePayout = async (e) => {
    e.preventDefault();
    if (!editingPayout.payoutAmount || isNaN(editingPayout.payoutAmount) || Number(editingPayout.payoutAmount) <= 0) {
      setEditErrors({ amount: 'Enter a valid amount > 0' });
      return;
    }

    try {
      setEditErrors({});
      await api.put(`/teacher/payout/${editingPayout._id}`, { amount: editingPayout.payoutAmount });
      setEditingPayout(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeletePayout = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this payout request?')) return;
    try {
      await api.delete(`/teacher/payout/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Teacher Earnings Dashboard" user={{ name: 'Professor Xavier', role: 'teacher' }} />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Lifetime Earnings" value={`$${data.totalEarnings}`} icon={DollarSign} color="green" />
          <StatCard title="Available for Payout" value={`$${data.availableBalance}`} icon={CreditCard} color="blue" />
          <StatCard title="Pending Withdrawals" value={`$${data.pendingPayoutAmount}`} icon={ArrowUpRight} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Send className="text-brand-500" /> Request Payout
            </h2>
            <div className="card">
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Withdrawal Amount ($)
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => {
                      setWithdrawalAmount(e.target.value);
                      if (errors.amount) setErrors({});
                    }}
                    placeholder="E.g. 50.00"
                    max={data.availableBalance}
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all ${errors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  {errors.amount && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.amount}</p>}
                  <p className="text-xs text-slate-500 mt-2">
                    Max available: ${data.availableBalance}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payout Method
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                    <option value="demo">Demo Payment (Standard)</option>
                    <option value="bank">Bank Transfer (Mock)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Confirm Withdrawal
                </button>
              </form>
            </div>
          </section>

          {/* Earnings & Payout History */}
          <section className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History className="text-brand-500" /> Recent Payouts
              </h2>
              <div className="card overflow-hidden !p-0">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Request Date</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {payoutHistory.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {format(new Date(p.requestDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {editingPayout?._id === p._id ? (
                            <div>
                              <input 
                                type="number"
                                value={editingPayout.payoutAmount}
                                onChange={e => {
                                  setEditingPayout({...editingPayout, payoutAmount: e.target.value});
                                  if (editErrors.amount) setEditErrors({});
                                }}
                                className={`w-24 p-1 rounded border bg-white dark:bg-slate-800 transition-colors ${editErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                              />
                              {editErrors.amount && <p className="text-[10px] text-red-500 mt-1 font-semibold leading-tight">{editErrors.amount}</p>}
                            </div>
                          ) : (
                            `$${p.payoutAmount}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${p.payoutStatus === 'completed' ? 'bg-green-100 text-green-700' : 
                              p.payoutStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.payoutStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {p.payoutStatus === 'pending' && (
                            <div className="flex justify-end gap-2">
                              {editingPayout?._id === p._id ? (
                                <>
                                  <button onClick={handleUpdatePayout} className="text-xs text-brand-600 font-bold hover:underline">Save</button>
                                  <button onClick={() => {setEditingPayout(null); setEditErrors({});}} className="text-xs text-slate-400 hover:underline">Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditingPayout(p)} className="p-1 text-slate-400 hover:text-brand-500 transition-colors">
                                    <Edit size={16} />
                                  </button>
                                  <button onClick={() => handleDeletePayout(p._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payoutHistory.length === 0 && <p className="p-6 text-center text-slate-500">No payout requests yet.</p>}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
