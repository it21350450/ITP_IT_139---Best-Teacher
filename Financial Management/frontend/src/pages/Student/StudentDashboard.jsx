import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { CreditCard, History, FileText, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];
const teacherOptions = ['Demo Teacher', 'Dr. Smith', 'Prof. Johnson', 'Mrs. Davis', 'Mr. Wilson'];

const StudentDashboard = () => {
  // Data states for transactions, invoices, and pending bookings
  const [pendingBookings, setPendingBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI and Form control states
  const [showForm, setShowForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ subject: '', amount: '', grade: 'Grade 10', teacherName: 'Demo Teacher' });
  const [editingBooking, setEditingBooking] = useState(null);
  
  // Validation error states
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Validates form data for lesson requests
   * @param {Object} data - The form data to validate
   * @returns {Object} - Object containing error messages
   */
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.subject?.trim()) newErrors.subject = 'Subject is required';
    
    // Teacher name is only required for new mock bookings, not for editing existing ones
    if (!data._id && !data.teacherName?.trim()) {
      newErrors.teacherName = 'Teacher name is required';
    }

    if (!data._id && !data.grade?.trim()) {
      newErrors.grade = 'Grade is required';
    }
    
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      newErrors.amount = 'Valid amount > 0 is required';
    }
    return newErrors;
  };

  // Fetch all dashboard data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, invoicesRes, pendingRes] = await Promise.all([
        api.get('/payments/history'),
        api.get('/payments/invoices'),
        api.get('/payments/pending-bookings')
      ]);
      
      setTransactions(historyRes.data);
      setInvoices(invoicesRes.data);
      setPendingBookings(pendingRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle creation of a new mock booking request
  const handleCreateMock = async (e) => {
    e.preventDefault();
    
    // Front-end validation check
    const validationErrors = validateForm(newLesson);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors({});
      await api.post('/payments/mock-booking', newLesson);
      setNewLesson({ subject: '', amount: '', grade: 'Grade 10', teacherName: 'Demo Teacher' });
      setShowForm(false);
      fetchData(); // Refresh dashboard
    } catch (err) {
      alert('Error creating lesson request');
    }
  };

  // Update an existing booking request
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation check for edit form
    const validationErrors = validateForm(editingBooking);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    try {
      setEditErrors({});
      await api.put(`/payments/booking/${editingBooking._id}`, editingBooking);
      setEditingBooking(null);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this lesson request?')) return;
    try {
      await api.delete(`/payments/booking/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handlePay = async (bookingId) => {
    try {
      await api.post('/payments/pay-booking', { bookingId, paymentMethod: 'demo-payment' });
      alert('Payment Successful!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Student Finance Portal" user={{ name: 'John Doe', role: 'student' }} />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Overview</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> {showForm ? 'Cancel' : 'Create New Lesson Request'}
          </button>
        </div>

        {showForm && (
          <div className="card bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleCreateMock} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject / Lesson</label>
                <input 
                  type="text" 
                  value={newLesson.subject} 
                  onChange={e => {
                    setNewLesson({...newLesson, subject: e.target.value});
                    if (errors.subject) setErrors({...errors, subject: null});
                  }}
                  placeholder="e.g. Pure Mathematics"
                  className={`w-full p-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.subject ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
                {errors.subject && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teacher Name</label>
                <select 
                  value={newLesson.teacherName} 
                  onChange={e => {
                    setNewLesson({...newLesson, teacherName: e.target.value});
                    if (errors.teacherName) setErrors({...errors, teacherName: null});
                  }}
                  className={`w-full p-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.teacherName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <option value="">Select Teacher</option>
                  {teacherOptions.map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
                {errors.teacherName && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.teacherName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label>
                <select 
                  value={newLesson.grade} 
                  onChange={e => {
                    setNewLesson({...newLesson, grade: e.target.value});
                    if (errors.grade) setErrors({...errors, grade: null});
                  }}
                  className={`w-full p-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.grade ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.grade}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  value={newLesson.amount} 
                  onChange={e => {
                    setNewLesson({...newLesson, amount: e.target.value});
                    if (errors.amount) setErrors({...errors, amount: null});
                  }}
                  placeholder="50"
                  className={`w-full p-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
                {errors.amount && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.amount}</p>}
              </div>
              <button type="submit" className="btn-primary h-[42px] mt-[18px]">Submit Request</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Spent" value={`$${transactions.reduce((acc, t) => acc + t.amount, 0)}`} icon={CheckCircle} color="blue" />
          <StatCard title="Pending Payments" value={pendingBookings.length} icon={Clock} color="orange" />
          <StatCard title="Total Invoices" value={invoices.length} icon={FileText} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Payments Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-orange-500" /> Pending Payments
            </h2>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <div key={booking._id} className="card hover:border-brand-300 transition-colors">
                  {editingBooking?._id === booking._id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div>
                        <input 
                          type="text" 
                          value={editingBooking.subject} 
                          onChange={e => {
                            setEditingBooking({...editingBooking, subject: e.target.value});
                            if (editErrors.subject) setEditErrors({...editErrors, subject: null});
                          }}
                          className={`w-full p-2 text-sm rounded border bg-white dark:bg-slate-800 transition-colors ${editErrors.subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                        />
                        {editErrors.subject && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.subject}</p>}
                      </div>
                      <div>
                        <input 
                          type="number" 
                          value={editingBooking.amount} 
                          onChange={e => {
                            setEditingBooking({...editingBooking, amount: e.target.value});
                            if (editErrors.amount) setEditErrors({...editErrors, amount: null});
                          }}
                          className={`w-full p-2 text-sm rounded border bg-white dark:bg-slate-800 transition-colors ${editErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                        />
                        {editErrors.amount && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.amount}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-xs py-1 px-3">Save</button>
                        <button type="button" onClick={() => {setEditingBooking(null); setEditErrors({});}} className="btn-secondary text-xs py-1 px-3">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{booking.subject}</h4>
                        <p className="text-sm text-slate-500">Grade: {booking.grade || 'Grade 10'}</p>
                        <p className="text-sm text-slate-500">Teacher: {booking.teacherId?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingBooking(booking)} className="p-1 text-slate-400 hover:text-brand-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(booking._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                          <span className="text-lg font-bold text-slate-900 dark:text-white ml-2">${booking.amount}</span>
                        </div>
                        <button 
                          onClick={() => handlePay(booking._id)}
                          className="btn-primary flex items-center gap-2 text-sm"
                        >
                          <CreditCard size={16} /> Pay Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {pendingBookings.length === 0 && <p className="text-slate-500 italic">No pending payments.</p>}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="text-brand-500" /> Payment History
            </h2>
            <div className="card overflow-hidden !p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Lesson: {tx.bookingId?.subject || 'Tutoring Session'}
                        </p>
                        <p className="text-xs text-slate-400">Ref: {tx.transactionReference}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        ${tx.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${tx.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && <p className="p-6 text-center text-slate-500">No transactions yet.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
