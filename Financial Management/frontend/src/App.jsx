import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import StudentDashboard from './pages/Student/StudentDashboard';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { GraduationCap, School, ShieldCheck } from 'lucide-react';
import api from './services/api';

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();

  const handleSwitch = (role) => {
    onRoleChange(role);
    navigate(`/${role}`);
  };

  return (
    <div className="bg-slate-800 p-2 flex justify-center gap-4 text-xs font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md">
      <button 
        onClick={() => handleSwitch('student')}
        className={`flex items-center gap-1 p-2 rounded transition-all duration-200 ${currentRole === 'student' ? 'bg-brand-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
      >
        <GraduationCap size={14} /> Student View
      </button>
      <button 
        onClick={() => handleSwitch('teacher')}
        className={`flex items-center gap-1 p-2 rounded transition-all duration-200 ${currentRole === 'teacher' ? 'bg-brand-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
      >
        <School size={14} /> Teacher View
      </button>
      <button 
        onClick={() => handleSwitch('admin')}
        className={`flex items-center gap-1 p-2 rounded transition-all duration-200 ${currentRole === 'admin' ? 'bg-brand-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
      >
        <ShieldCheck size={14} /> Admin View
      </button>
    </div>
  );
};

function AppContent() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'student');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const loginDemo = async () => {
      setIsAuthenticating(true);
      try {
        const { data } = await api.post('/auth/demo-login', { role });
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
      } catch (err) {
        console.error('Demo login failed:', err);
      } finally {
        // Short timeout to feel like a real auth transition
        setTimeout(() => setIsAuthenticating(false), 300);
      }
    };
    loginDemo();
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-500/30">
      <RoleSwitcher currentRole={role} onRoleChange={(r) => setRole(r)} />

      {isAuthenticating ? (
        <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-brand-500/10 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-900 dark:text-white font-bold text-lg">Switching Context</p>
            <p className="text-slate-500 text-sm">Loading {role} workspace...</p>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to={`/${role}`} replace />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
