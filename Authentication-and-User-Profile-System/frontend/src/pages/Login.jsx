import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginContext, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/profile');
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        loginContext(data, data.token);
        navigate('/profile');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="card-title">Welcome Back</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            name="email" 
            className="form-input" 
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            name="password" 
            className="form-input" 
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password" 
          />
        </div>
        
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact support to reset your password.'); }} style={{ fontSize: '0.875rem' }}>Forgot Password?</a>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
};

export default Login;
