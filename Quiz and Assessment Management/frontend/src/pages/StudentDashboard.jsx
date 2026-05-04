import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, CheckCircle, Clock, BookOpen, ChevronRight, Award, Target, TrendingUp, BarChart } from 'lucide-react';

const StudentDashboard = ({ user }) => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [quizzesRes, submissionsRes] = await Promise.all([
        axios.get('/api/quizzes/available', config),
        axios.get('/api/submissions/my-submissions', config)
      ]);
      setAvailableQuizzes(quizzesRes.data);
      setMySubmissions(submissionsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading available quizzes...</div>;

  const totalSubmissions = mySubmissions.length;
  const totalScore = mySubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
  const averageScore = totalSubmissions > 0 ? (totalScore / totalSubmissions).toFixed(1) : 0;
  const highestScore = mySubmissions.length > 0 ? Math.max(...mySubmissions.map(sub => sub.score || 0)) : 0;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">Student Dashboard</h2>
        <p className="text-text-gray text-lg">Browse and tackle your upcoming assessments.</p>
      </div>

      {/* Student Insights Section */}
      <div className="mb-12">
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-6 opacity-80">
          <BarChart className="text-primary" size={24} /> 
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card hover:border-primary/50 transition-colors flex items-center gap-4 p-5">
            <div className="p-4 bg-primary/20 text-primary rounded-xl">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-text-gray text-[10px] uppercase tracking-widest font-black mb-1">Quizzes Taken</p>
              <p className="text-3xl font-black text-white">{totalSubmissions}</p>
            </div>
          </div>
          <div className="glass-card hover:border-success/50 transition-colors flex items-center gap-4 p-5">
            <div className="p-4 bg-success/20 text-success rounded-xl">
              <Award size={28} />
            </div>
            <div>
              <p className="text-text-gray text-[10px] uppercase tracking-widest font-black mb-1">Total Score</p>
              <p className="text-3xl font-black text-white">{totalScore}</p>
            </div>
          </div>
          <div className="glass-card hover:border-warning/50 transition-colors flex items-center gap-4 p-5">
            <div className="p-4 bg-warning/20 text-warning rounded-xl">
              <Target size={28} />
            </div>
            <div>
              <p className="text-text-gray text-[10px] uppercase tracking-widest font-black mb-1">Average Score</p>
              <p className="text-3xl font-black text-white">{averageScore}</p>
            </div>
          </div>
          <div className="glass-card hover:border-error/50 transition-colors flex items-center gap-4 p-5">
            <div className="p-4 bg-error/20 text-error rounded-xl">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-text-gray text-[10px] uppercase tracking-widest font-black mb-1">Highest Score</p>
              <p className="text-3xl font-black text-white">{highestScore}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full mb-4">
          <h3 className="flex items-center gap-2 text-xl font-semibold opacity-80">
            <Clock className="text-primary" size={24} /> 
            Open Assessments
          </h3>
        </div>

        {availableQuizzes.length === 0 ? (
          <div className="glass-card col-span-full py-12 text-center opacity-60">
            <BookOpen className="mx-auto mb-4" size={40} />
            <p>No assessments available at the moment. Check back later!</p>
          </div>
        ) : (
          availableQuizzes.map(quiz => (
            <div key={quiz._id} className="glass-card group hover:border-primary/50 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h4 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors tracking-tight">{quiz.title}</h4>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full">{quiz.subject}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/10 px-3 py-1 rounded-full">{quiz.grade}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-gray block mb-1">Due Date</span>
                  <div className="text-sm text-error font-black flex items-center gap-1 bg-error/10 px-3 py-1 rounded-lg border border-error/20">
                    <Clock size={14} /> {new Date(quiz.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <p className="text-text-gray text-sm mb-10 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {quiz.description}
              </p>

              <div className="flex items-center justify-between border-t border-glass-border pt-6 relative z-10">
                <div className="flex -space-x-3">
                   {/* Mock avatars for excitement */}
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-xl border-2 border-bg-darker bg-glass overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${quiz._id + i}`} alt="Student" />
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-xl border-2 border-bg-darker bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                     +12
                   </div>
                </div>

                <Link 
                  to={`/student/quiz/${quiz._id}`}
                  className="btn btn-primary shadow-xl shadow-primary/30 group-hover:scale-105 transition-all duration-300"
                  style={{ borderRadius: '14px', padding: '0.75rem 1.5rem' }}
                >
                  <span className="font-black uppercase tracking-widest text-xs">Start Attempt</span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Assessments */}
      <div className="mt-16">
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-6 opacity-80">
          <CheckCircle className="text-success" size={24} /> 
          Completed Assessments
        </h3>
        
        {mySubmissions.length === 0 ? (
          <div className="glass-card opacity-50 bg-transparent border-dashed text-center py-10">
            <p className="text-text-gray">Your previous submissions and grades will appear here once you take a quiz.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {mySubmissions.map(sub => (
              <div key={sub._id} className="glass-card flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl ${sub.graded ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{sub.quizId?.title || 'Unknown Quiz'}</h4>
                    <p className="text-xs text-text-gray uppercase tracking-widest">
                      {sub.quizId?.subject} • {sub.quizId?.grade} • Submitted {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-text-gray">Score</span>
                    <span className="text-xl font-black text-primary">{sub.score} <span className="text-xs text-text-gray">pts</span></span>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <span className={`badge ${sub.graded ? 'badge-success' : 'badge-warning'}`}>
                      {sub.graded ? 'Graded' : 'Pending'}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/student/result/${sub._id}`}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
