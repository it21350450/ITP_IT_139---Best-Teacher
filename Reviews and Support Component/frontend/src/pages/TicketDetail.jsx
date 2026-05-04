import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ticketService from '../services/ticketService';

const TicketDetail = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [updating, setUpdating] = useState(false);
    
    const token = localStorage.getItem('token');
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        currentUser = null;
    }

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const data = await ticketService.getTicketDetails(id, token);
            setTicket(data);
            setEditSubject(data.subject);
            setEditDescription(data.description);
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const cleanResponse = response.trim();
        
        if (!cleanResponse) return;
        
        if (cleanResponse.length < 2) {
            alert('Reply is too short');
            return;
        }

        setSending(true);
        try {
            await ticketService.respondToTicket(id, cleanResponse, token);
            setResponse('');
            await fetchTicket();
        } catch (error) {
            alert('Failed to send response');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
        
        try {
            await ticketService.deleteTicket(id, token);
            window.location.href = '/tickets'; // Direct navigation to avoid stale state
        } catch (error) {
            alert('Failed to delete ticket');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editSubject.trim() || !editDescription.trim()) {
            alert('Subject and description are required');
            return;
        }

        setUpdating(true);
        try {
            await ticketService.updateTicket(id, { 
                subject: editSubject.trim(), 
                description: editDescription.trim() 
            }, token);
            setIsEditing(false);
            await fetchTicket();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update ticket');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!ticket) return <div>Ticket not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Ticket #{ticket._id.substring(0, 8)}</div>
                        {isEditing ? (
                            <input 
                                type="text"
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                className="text-2xl font-bold text-gray-900 border-b border-blue-500 outline-none w-full bg-transparent"
                                placeholder="Ticket Subject"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {ticket.isReadByRecipient && currentUser?.role === 'student' && (
                            <div className="flex items-center gap-1 text-blue-500 font-bold text-[10px] uppercase tracking-widest mr-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Seen by Recipient
                            </div>
                        )}
                        {currentUser?._id === (ticket.studentId?._id || ticket.studentId) && (
                            <div className="flex items-center gap-2">
                                {ticket.status === 'Open' && (
                                    <>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={handleUpdate}
                                                    disabled={updating}
                                                    className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {updating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditSubject(ticket.subject);
                                                        setEditDescription(ticket.description);
                                                    }}
                                                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Edit Ticket"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                        )}
                                    </>
                                )}
                                <button 
                                    onClick={handleDelete}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Ticket"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        )}
                        {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                            <select 
                                value={ticket.status}
                                onChange={async (e) => {
                                    try {
                                        await ticketService.updateTicketStatus(ticket._id, e.target.value, token);
                                        await fetchTicket();
                                    } catch (err) {
                                        alert('Failed to update status');
                                    }
                                }}
                                className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        )}
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' : 
                            ticket.status === 'Closed' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                            {ticket.status}
                        </span>
                    </div>
                </div>

                {/* Conversation Thread */}
                <div className="p-8 space-y-8 min-h-[400px]">
                    {/* Original Issue */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {ticket.studentId?.name?.[0] || 'S'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-800">{ticket.studentId?.name}</span>
                                <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full bg-blue-50 p-5 rounded-2xl rounded-tl-none text-gray-700 leading-relaxed shadow-sm border border-blue-200 outline-none focus:ring-1 focus:ring-blue-400 min-h-[150px]"
                                    placeholder="Ticket Description"
                                />
                            ) : (
                                <div className="bg-blue-50 p-5 rounded-2xl rounded-tl-none text-gray-700 leading-relaxed shadow-sm">
                                    {ticket.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Responses */}
                    {ticket.responses.map((res, idx) => (
                        <div key={idx} className={`flex gap-4 ${res.responderId?.role === 'admin' || res.responderId?.role === 'teacher' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                res.responderId?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {res.responderId?.name?.[0] || 'R'}
                            </div>
                            <div className={`flex-1 ${res.responderId?.role === 'admin' || res.responderId?.role === 'teacher' ? 'text-right' : ''}`}>
                                <div className={`flex items-center gap-2 mb-1 ${res.responderId?.role === 'admin' || res.responderId?.role === 'teacher' ? 'justify-end' : ''}`}>
                                    <span className="font-bold text-gray-800">
                                        {res.responderId?.name} 
                                        {res.responderId?.role === 'admin' && <span className="ml-2 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase">Admin</span>}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(res.createdAt).toLocaleString()}</span>
                                </div>
                                <div className={`p-5 rounded-2xl text-gray-700 leading-relaxed shadow-sm inline-block text-left ${
                                    res.responderId?.role === 'admin' || res.responderId?.role === 'teacher' 
                                        ? 'bg-purple-50 rounded-tr-none border border-purple-100' 
                                        : 'bg-blue-50 rounded-tl-none border border-blue-100'
                                }`}>
                                    {res.message}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                {ticket.status !== 'Closed' && (
                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative">
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none pr-32 min-h-[100px]"
                            ></textarea>
                            <button
                                type="submit"
                                disabled={sending || !response.trim()}
                                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send Reply'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;
