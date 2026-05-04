import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', role: 'student', contactNumber: '', profilePicture: '' 
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { loginContext, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/profile');
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, contactNumber: value });
    if (fieldErrors.contactNumber) {
      setFieldErrors({ ...fieldErrors, contactNumber: '' });
    }
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    let currentErrors = {};
    let hasError = false;

    if (!formData.name) { currentErrors.name = 'Full Name is required'; hasError = true; }
    if (!formData.email) { currentErrors.email = 'Email Address is required'; hasError = true; }
    if (!formData.contactNumber) { currentErrors.contactNumber = 'Contact Number is required'; hasError = true; }
    else if (formData.contactNumber.length !== 10) { currentErrors.contactNumber = 'Contact number must be exactly 10 digits'; hasError = true; }
    
    if (!formData.password) { currentErrors.password = 'Password is required'; hasError = true; }
    else if (!validatePassword(formData.password)) { currentErrors.password = 'Password must be at least 6 characters long'; hasError = true; }

    if (!formData.confirmPassword) { currentErrors.confirmPassword = 'Confirm Password is required'; hasError = true; }
    else if (formData.password !== formData.confirmPassword) { currentErrors.confirmPassword = 'Passwords do not match'; hasError = true; }
    
    if (formData.profilePicture && !formData.profilePicture.match(/^https?:\/\/.+/i)) {
      currentErrors.profilePicture = 'Please enter a valid URL (http:// or https://)';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(currentErrors);
      return;
    }

    setLoading(true);
    // Exclude confirmPassword from the data sent to the backend
    const { confirmPassword, ...submitData } = formData;
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        loginContext(data, data.token);
        navigate('/profile');
      } else {
        setError(data.message || data.errors?.[0]?.msg || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="card-title">Create Account</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            type="text" name="name" className={`form-input ${fieldErrors.name ? 'input-error' : ''}`} 
            value={formData.name} onChange={handleChange} placeholder="John Doe" 
          />
          {fieldErrors.name && <div className="error-text">{fieldErrors.name}</div>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" name="email" className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} 
            value={formData.email} onChange={handleChange} placeholder="john@example.com" 
          />
          {fieldErrors.email && <div className="error-text">{fieldErrors.email}</div>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Contact Number</label>
          <input 
            type="text" name="contactNumber" className={`form-input ${fieldErrors.contactNumber ? 'input-error' : ''}`} 
            value={formData.contactNumber} onChange={handleContactChange} placeholder="1234567890" 
          />
          {fieldErrors.contactNumber && <div className="error-text">{fieldErrors.contactNumber}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Profile Picture URL (Optional)</label>
          <input 
            type="text" name="profilePicture" className={`form-input ${fieldErrors.profilePicture ? 'input-error' : ''}`} 
            value={formData.profilePicture} onChange={handleChange} placeholder="https://example.com/photo.jpg" 
          />
          {fieldErrors.profilePicture && <div className="error-text">{fieldErrors.profilePicture}</div>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" name="password" className={`form-input ${fieldErrors.password ? 'input-error' : ''}`} 
            value={formData.password} onChange={handleChange} placeholder="Min 6 characters" 
          />
          {fieldErrors.password && <div className="error-text">{fieldErrors.password}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input 
            type="password" name="confirmPassword" className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`} 
            value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" 
          />
          {fieldErrors.confirmPassword && <div className="error-text">{fieldErrors.confirmPassword}</div>}
        </div>
        
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;

