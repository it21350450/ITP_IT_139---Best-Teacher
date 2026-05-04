import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, token, setUser, logout } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', contactNumber: '', profilePicture: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                contactNumber: user.contactNumber || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (formData.contactNumber && formData.contactNumber.length !== 10) {
            setMessage({ type: 'error', text: 'Contact number must be exactly 10 digits' });
            return;
        }

        if (formData.profilePicture && !formData.profilePicture.match(/^https?:\/\/.+/i)) {
            setMessage({ type: 'error', text: 'Please enter a valid URL for the profile picture (starting with http:// or https://)' });
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Update failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users/delete-account', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                logout();
                navigate('/register');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Delete failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        }
    };

    if (!user) return <div className="container">Loading profile...</div>;

    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="profile-card">
            <div className="profile-header">
                <div className="profile-avatar">
                   {user.profilePicture && user.profilePicture !== 'default.jpg' ? (
                       <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                   ) : (
                       initials
                   )}
                </div>
                <div className="profile-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <span className="role-badge">{user.role}</span>
                    <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {!isEditing ? (
                <div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <strong className="form-label">Contact Number:</strong>
                        <p>{user.contactNumber || 'Not provided'}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button className="btn" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                        <button className="btn" style={{ backgroundColor: '#64748b' }} onClick={() => navigate('/change-password')}>
                            Change Password
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button 
                            className="btn btn-danger" 
                            style={{ width: 'auto' }}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={formData.contactNumber} 
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData({...formData, contactNumber: val});
                            }} 
                            placeholder="1234567890"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Profile Picture URL (Optional)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={formData.profilePicture} 
                            onChange={(e) => setFormData({...formData, profilePicture: e.target.value})} 
                            placeholder="https://example.com/photo.jpg"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="submit" className="btn">Save Changes</button>
                        <button type="button" className="btn" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }} onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Confirmation Modal for Account Deletion */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="card-title">Delete Account</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn btn-danger" onClick={handleDeleteAccount}>
                                Yes, Delete My Account
                            </button>
                            <button className="btn" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }} onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
