import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">EduConnect</Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">Dashboard</Link>
              )}
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '8px 16px', width: 'auto' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn" style={{ padding: '8px 16px', width: 'auto' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
