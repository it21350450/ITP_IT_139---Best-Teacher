import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ticketService from '../services/ticketService';
import TicketCard from '../components/TicketCard';

const TicketDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('received'); // 'received' or 'sent'
    const [statusFilter, setStatusFilter] = useState('All');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTickets = async () => {
            if (!token) return;
            setLoading(true);
            try {
                let user = null;
                try {
                    user = JSON.parse(localStorage.getItem('user'));
                } catch (e) {
                    user = null;
                }
                if (!user) return;
                
                let data;
                if (user.role === 'student') {
                    data = await ticketService.getStudentTickets(token);
                } else if (user.role === 'teacher') {
                    if (view === 'received') {
                        data = await ticketService.getTeacherTickets(token);
                    } else {
                        data = await ticketService.getStudentTickets(token);
                    }
                } else if (user.role === 'admin') {
                    data = await ticketService.getAdminTickets(token);
                }
                setTickets(data || []);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [token, view]);

    const filteredTickets = tickets.filter(ticket => 
        statusFilter === 'All' || ticket.status === statusFilter
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-500">Track and manage your inquiries</p>
                </div>
                <div className="flex gap-4 items-center">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <Link 
                        to="/create-ticket" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        New Ticket
                    </Link>
                </div>
            </div>

            {/* Teacher Tabs */}
            {JSON.parse(localStorage.getItem('user'))?.role === 'teacher' && (
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setView('received')}
                        className={`pb-3 px-2 text-sm font-bold transition-all ${view === 'received' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Inquiries Received
                    </button>
                    <button 
                        onClick={() => setView('sent')}
                        className={`pb-3 px-2 text-sm font-bold transition-all ${view === 'sent' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Tickets I've Sent
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
                </div>
            ) : filteredTickets.length > 0 ? (
                <div className="grid gap-2">
                    {filteredTickets.map(ticket => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No tickets yet</h3>
                    <p className="text-gray-500 mb-8">If you have any questions or issues, feel free to contact us.</p>
                    <Link to="/create-ticket" className="text-blue-600 font-semibold hover:underline">
                        Create your first ticket →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TicketDashboard;
