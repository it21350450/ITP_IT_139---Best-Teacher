import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password has been updated successfully.' });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error changing password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="card-title">Change Password</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input 
            type="password" 
            name="oldPassword" 
            className="form-input" 
            value={formData.oldPassword} 
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            name="newPassword" 
            className="form-input" 
            value={formData.newPassword} 
            onChange={handleChange}
            placeholder="Min 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            className="form-input" 
            value={formData.confirmPassword} 
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }} 
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
