import React, { useState, useEffect } from 'react';

const RoleSelector = () => {
    const [currentRole, setCurrentRole] = useState(localStorage.getItem('role') || 'none');

    const roles = [
        { id: 'student', name: '👩‍🎓 Student', user: { _id: '640f1a2b3c4d5e6f7a8b9c01', name: 'John Student', role: 'student' } },
        { id: 'teacher', name: '👨‍🏫 Teacher', user: { _id: '640f1a2b3c4d5e6f7a8b9c02', name: 'Prof. Smith', role: 'teacher' } },
        { id: 'admin', name: '🛡️ Admin', user: { _id: '640f1a2b3c4d5e6f7a8b9c03', name: 'System Admin', role: 'admin' } }
    ];

    const selectRole = (role) => {
        localStorage.setItem('role', role.id);
        localStorage.setItem('user', JSON.stringify(role.user));
        localStorage.setItem('token', 'mock-jwt-token-' + role.id); // In a real app, this would be a real JWT
        setCurrentRole(role.id);
        window.location.reload(); // Refresh to update all components with new role
    };

    return (
        <div className="bg-gray-900 text-white py-2 px-4 flex items-center justify-between text-xs sticky top-0 z-[60]">
            <div className="flex items-center gap-4">
                <span className="font-bold text-blue-400 uppercase tracking-widest">Simulation Mode:</span>
                <div className="flex gap-2">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => selectRole(role)}
                            className={`px-3 py-1 rounded-full transition-all ${
                                currentRole === role.id 
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="text-gray-500 italic">
                Currently acting as: <span className="text-white not-italic font-semibold">{currentRole !== 'none' && roles.find(r => r.id === currentRole) ? roles.find(r => r.id === currentRole).user.name : 'Guest'}</span>
            </div>
        </div>
    );
};

export default RoleSelector;
