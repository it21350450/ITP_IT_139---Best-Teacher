import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuiz from './pages/CreateQuiz';
import StudentDashboard from './pages/StudentDashboard';
import QuizAttempt from './pages/QuizAttempt';
import SubmissionDetails from './pages/SubmissionDetails';
import ViewSubmissions from './pages/ViewSubmissions';
import { LayoutDashboard, PlusCircle, BookOpen, User, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  // Initialize with a default user if none exists
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser) {
      switchRole('teacher');
    }
  }, []);

  const switchRole = (role) => {
    const mockUser = {
      id: role === 'teacher' ? '65f3a0a1e4b0a1b2c3d4e5f5' : '65f3a1b2e4b0a1b2c3d4e5f6',
      name: role === 'teacher' ? 'Dr. Smith' : 'John Doe',
      role: role,
      token: `mock_role_${role}`
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    navigate(role === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card m-6 flex items-center justify-between animate-fade-in py-3 px-8" style={{ borderRadius: '24px' }}>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student')}>
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-all duration-300">
              <BookOpen className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tightest">
              Best <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-text-gray">Teacher</span>
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => switchRole('teacher')}
              className={`px-8 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${user?.role === 'teacher' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-text-gray hover:text-white hover:bg-white/5'}`}
            >
              Teacher View
            </button>
            <button 
              onClick={() => switchRole('student')}
              className={`px-8 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${user?.role === 'student' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-text-gray hover:text-white hover:bg-white/5'}`}
            >
              Student View
            </button>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 bg-white/5 pl-4 pr-1.5 py-1.5 rounded-2xl border border-white/10">
              <div className="flex flex-col text-right">
                <span className="text-sm font-black tracking-tight leading-none mb-1">{user.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-black opacity-80">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black shadow-lg">
                {user.name.charAt(0)}
              </div>
            </div>
            
            {user.role === 'teacher' && (
              <Link to="/teacher/create" className="btn btn-primary shadow-xl shadow-primary/30 rounded-2xl py-3 px-6">
                <PlusCircle size={20} /> <span className="hidden sm:inline">Create Quiz</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '1rem' }}>
        <Routes>
          <Route path="/" element={<div className="text-center mt-20">Redirecting...</div>} />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard user={user} />} />
          <Route path="/teacher/create" element={<CreateQuiz user={user} />} />
          <Route path="/teacher/edit/:id" element={<CreateQuiz user={user} isEdit={true} />} />
          <Route path="/teacher/submissions/:id" element={<ViewSubmissions user={user} />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard user={user} />} />
          <Route path="/student/quiz/:id" element={<QuizAttempt user={user} />} />
          <Route path="/student/result/:id" element={<SubmissionDetails user={user} isResult={true} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
