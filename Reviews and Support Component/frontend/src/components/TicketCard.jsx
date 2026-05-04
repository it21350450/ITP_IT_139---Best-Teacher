import React from 'react';
import { Link } from 'react-router-dom';

const TicketCard = ({ ticket }) => {
    const statusColors = {
        'Open': 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Resolved': 'bg-green-100 text-green-700 border-green-200',
        'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Link to={`/tickets/${ticket._id}`} className="block">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate max-w-[60%]">{ticket.subject}</h3>
                    <div className="flex items-center gap-2">
                        {ticket.isReadByRecipient && (
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Seen
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
                            {ticket.status}
                        </span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {ticket.description}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] uppercase tracking-wider font-semibold">
                    <div className="flex items-center gap-2">
                        {ticket.studentId?.name ? (
                            <span className="text-gray-500">From: <span className="text-gray-900">{ticket.studentId.name}</span></span>
                        ) : (
                            <span className="text-gray-500">To: <span className="text-gray-900">{ticket.recipientId?.name || ticket.recipientType}</span></span>
                        )}
                    </div>
                    <span>{formatDate(ticket.createdAt)}</span>
                </div>
            </div>
        </Link>
    );
};

export default TicketCard;
