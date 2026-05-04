import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import userService from '../services/userService';

const CreateTicket = () => {
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        recipientType: 'Teacher',
        recipientId: '' // This would usually be pre-selected if coming from a profile
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    React.useEffect(() => {
        const fetchUsers = async () => {
            if (formData.recipientType === 'Admin') {
                setUsers([]);
                return;
            }
            setFetchingUsers(true);
            try {
                const results = await userService.getUsers({ 
                    role: formData.recipientType.toLowerCase() 
                });
                setUsers(results);
                // Reset recipientId if the current one is not in the new list
                if (results.length > 0) {
                    setFormData(prev => ({ ...prev, recipientId: '' }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingUsers(false);
            }
        };
        fetchUsers();
    }, [formData.recipientType]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        if (!formData.subject.trim()) {
            setError('Subject is required');
            return false;
        }
        if (formData.subject.trim().length < 5) {
            setError('Subject must be at least 5 characters');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return false;
        }
        if (formData.description.trim().length < 20) {
            setError('Description must be at least 20 characters to help us understand the issue');
            return false;
        }
        if (formData.recipientType !== 'Admin' && !formData.recipientId) {
            setError('Please select a specific user');
            return false;
        }
        return true;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            const submitData = { ...formData };
            if (submitData.recipientType === 'Admin') {
                delete submitData.recipientId;
            }

            await ticketService.createTicket(submitData, token);
            navigate('/tickets');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Raise a Support Ticket</h1>
                    <p className="text-blue-100 text-sm opacity-90">We're here to help you solve any issues</p>
                </div>
                
                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Role</label>
                        <select
                            name="recipientType"
                            value={formData.recipientType}
                            onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        >
                            <option value="Teacher">Teacher</option>
                            {currentUser?.role === 'admin' && <option value="Student">Student</option>}
                            <option value="Admin">Platform Administration</option>
                        </select>
                    </div>

                    {formData.recipientType !== 'Admin' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select {formData.recipientType}</label>
                            {fetchingUsers ? (
                                <div className="text-sm text-gray-500 py-2">Loading {formData.recipientType.toLowerCase()}s...</div>
                            ) : (
                                <select
                                    name="recipientId"
                                    value={formData.recipientId}
                                    onChange={onChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                >
                                    <option value="">Select a {formData.recipientType.toLowerCase()}</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            placeholder="Briefly describe the issue"
                            value={formData.subject}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                        <textarea
                            name="description"
                            rows="5"
                            placeholder="Provide as much detail as possible..."
                            value={formData.description}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Response time is usually within 24-48 hours.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
