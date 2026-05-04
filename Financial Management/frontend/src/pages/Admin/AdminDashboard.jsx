import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { Shield, Users, DollarSign, Settings, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  // Main operational data: all transactions and payout requests across the platform
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  
  // Platform settings: dynamic fee management
  const [platformFee, setPlatformFee] = useState(10);
  const [loading, setLoading] = useState(true);
  
  // Validation error state for platform settings
  const [feeError, setFeeError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch system-wide financial and payout data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, payoutRes] = await Promise.all([
        api.get('/admin/transactions'),
        api.get('/admin/payouts')
      ]);
      setTransactions(txRes.data);
      setPayouts(payoutRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update the global platform fee percentage with validation
  const handleUpdateFee = async () => {
    // Fee must be a number between 0 and 100 inclusive
    if (platformFee === '' || isNaN(platformFee) || Number(platformFee) < 0 || Number(platformFee) > 100) {
      setFeeError('Fee must be between 0 and 100');
      return;
    }
    
    try {
      setFeeError('');
      await api.put('/admin/platform-fee', { percentage: Number(platformFee) });
      alert('Platform fee updated!');
    } catch (err) {
      alert('Update failed');
    }
  };

  // Approve or reject a teacher's payout request
  const handleProcessPayout = async (payoutId, status) => {
    try {
      await api.post('/admin/payout/process', { payoutId, status, adminNote: 'Processed by Admin' });
      alert(`Payout ${status}`);
      fetchData(); // Refresh list
    } catch (err) {
      alert('Process failed');
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm('Are you sure you want to refund this transaction?')) return;
    try {
      await api.post('/admin/refund', { transactionId });
      alert('Refund processed!');
      fetchData();
    } catch (err) {
      alert('Refund failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Platform Administration" user={{ name: 'Admin User', role: 'admin' }} />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Platform Revenue" value={`$${transactions.reduce((acc, t) => acc + (t.platformFee || 0), 0)}`} icon={Shield} color="purple" />
          <StatCard title="Total Volume" value={`$${transactions.reduce((acc, t) => acc + t.amount, 0)}`} icon={DollarSign} color="green" />
          <StatCard title="Active Payouts" value={payouts.filter(p => p.payoutStatus === 'pending').length} icon={RefreshCw} color="orange" />
          <StatCard title="Fee Config" value={`${platformFee}%`} icon={Settings} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <section className="card space-y-4 h-fit">
            <h2 className="text-xl font-bold">Platform Settings</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Global Platform Fee (%)
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={platformFee}
                    onChange={(e) => {
                      setPlatformFee(e.target.value);
                      if (feeError) setFeeError('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${feeError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  <button onClick={handleUpdateFee} className="btn-primary">Update</button>
                </div>
                {feeError && <p className="text-xs text-red-500 font-semibold">{feeError}</p>}
              </div>
            </div>
          </section>

          {/* Pending Payouts Section */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <RefreshCw className="text-orange-500" /> Pending Payout Requests
            </h2>
            <div className="space-y-3">
              {payouts.filter(p => p.payoutStatus === 'pending').map((p) => (
                <div key={p._id} className="card flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Request from: {p.teacherId?.name || 'Unknown Teacher'}
                    </h4>
                    <p className="text-sm text-slate-500">{p.teacherId?.email}</p>
                    <p className="text-xs text-slate-400">Requested: {format(new Date(p.requestDate), 'MMM dd, HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold mr-4">${p.payoutAmount}</span>
                    <button onClick={() => handleProcessPayout(p._id, 'completed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <CheckCircle size={24} />
                    </button>
                    <button onClick={() => handleProcessPayout(p._id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <XCircle size={24} />
                    </button>
                  </div>
                </div>
              ))}
              {payouts.filter(p => p.payoutStatus === 'pending').length === 0 && <p className="text-slate-500 italic">No pending payout requests.</p>}
            </div>
          </section>
        </div>

        {/* Master Transaction Ledger */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-brand-500" /> Master Transaction Ledger
          </h2>
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ref</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fee</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{tx.transactionReference}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{tx.studentId?.name}</td>
                    <td className="px-6 py-4 text-sm font-bold">${tx.amount}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-medium">${tx.platformFee}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${tx.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tx.paymentStatus === 'completed' && (
                        <button 
                          onClick={() => handleRefund(tx._id)}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
