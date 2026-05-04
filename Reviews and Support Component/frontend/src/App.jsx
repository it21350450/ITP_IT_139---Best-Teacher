import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TeacherProfile from './pages/TeacherProfile';
import CreateTicket from './pages/CreateTicket';
import TicketDashboard from './pages/TicketDashboard';
import TicketDetail from './pages/TicketDetail';
import CreateReview from './pages/CreateReview';

import RoleSelector from './components/RoleSelector';

function App() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }
  const role = user?.role;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <RoleSelector />
        <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-8 z-50 shadow-sm">
          <Link to="/" className="text-xl font-bold text-blue-600">Best Teacher</Link>
          <div className="flex gap-6 text-sm font-semibold text-gray-600 italic">
            {role === 'student' && (
              <>
                <Link to="/teacher/640f1a2b3c4d5e6f7a8b9c02" className="hover:text-blue-600 transition-colors">Find Teachers</Link>
                <Link to="/create-review" className="hover:text-blue-600 transition-colors">Write Review</Link>
                <Link to="/tickets" className="hover:text-blue-600 transition-colors">My Tickets</Link>
                <Link to="/create-ticket" className="hover:text-blue-600 transition-colors">Support</Link>
              </>
            )}
            {role === 'teacher' && (
              <>
                <Link to="/teacher/640f1a2b3c4d5e6f7a8b9c02" className="hover:text-blue-600 transition-colors">My Profile</Link>
                <Link to="/tickets" className="hover:text-blue-600 transition-colors">Student Inquiries</Link>
                <Link to="/create-ticket" className="hover:text-blue-600 transition-colors">Support (to Admin)</Link>
              </>
            )}
            {role === 'admin' && (
              <>
                <Link to="/tickets" className="hover:text-blue-600 transition-colors">All Tickets</Link>
                <Link to="/create-ticket" className="hover:text-blue-600 transition-colors">Message Users</Link>
              </>
            )}
            {!role && <span className="text-gray-400">Please select a role above to start</span>}
          </div>
        </nav>

        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="max-w-4xl mx-auto py-20 text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Welcome to Reviews & Support</h1>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                  Use the simulation bar at the top to switch between roles and explore the features. 
                  This is a standalone demo of the Best Teacher support and review ecosystem.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="text-3xl mb-4">⭐</div>
                    <h3 className="font-bold text-lg mb-2">Review System</h3>
                    <p className="text-sm text-gray-500">Students can rate teachers and leave feedback after lessons.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="text-3xl mb-4">🎫</div>
                    <h3 className="font-bold text-lg mb-2">Ticket Support</h3>
                    <p className="text-sm text-gray-500">Raise issues and track them in real-time with teachers or admins.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="text-3xl mb-4">🛡️</div>
                    <h3 className="font-bold text-lg mb-2">Admin Control</h3>
                    <p className="text-sm text-gray-500">Admins can manage all tickets and review inappropriate content.</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/teacher/:id" element={<TeacherProfile />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/tickets" element={<TicketDashboard />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/create-review" element={<CreateReview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
