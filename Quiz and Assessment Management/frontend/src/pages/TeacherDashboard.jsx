import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, Eye, Play, Pause, Users, Calendar, Book, PlusCircle } from 'lucide-react';

const TeacherDashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('/api/quizzes/teacher', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuizzes(res.data);
    } catch (err) {
      console.error('Error fetching quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id) => {
    try {
      await axios.patch(`/api/quizzes/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchQuizzes();
    } catch (err) {
      alert('Error toggling publish status');
    }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await axios.delete(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchQuizzes();
    } catch (err) {
      alert('Error deleting quiz');
    }
  };

  if (loading) return <div className="text-center">Loading quizzes...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tightest mb-2">Teacher Dashboard</h2>
          <p className="text-text-gray font-medium">Manage your academic assessments and track student progress</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white/5 py-2 px-4 rounded-xl border border-white/10 hidden lg:block">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-gray block leading-none mb-1">Total Quizzes</span>
              <span className="text-xl font-black text-primary">{quizzes.length}</span>
           </div>
           <Link to="/teacher/create" className="btn btn-primary shadow-xl shadow-primary/30 py-3 px-8 rounded-2xl">
            <PlusCircle size={20} /> Create Quiz
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {quizzes.length === 0 ? (
          <div className="glass-card col-span-3 text-center py-20 border-dashed bg-transparent">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <Book size={40} className="text-text-gray" />
            </div>
            <h3 className="text-2xl font-black mb-2">No quizzes created yet</h3>
            <p className="text-text-gray mb-8 max-w-md mx-auto">Start by creating your first academic assessment for your students. Your created quizzes will appear here.</p>
            <Link to="/teacher/create" className="btn btn-primary px-10 py-3 rounded-2xl">Create Your First Quiz</Link>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz._id} className="glass-card flex flex-col justify-between group h-full hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              {/* Highlight bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${quiz.isPublished ? 'bg-success' : 'bg-warning'}`}></div>
              
              <div className="p-2">
                <div className="flex justify-between items-center mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${quiz.isPublished ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${quiz.isPublished ? 'bg-success animate-pulse' : 'bg-warning'}`}></div>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-gray">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">
                      {new Date(quiz.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight">{quiz.title}</h3>
                <p className="text-text-gray text-sm mb-8 leading-relaxed opacity-80 line-clamp-2">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-gray">📘 {quiz.subject}</span>
                  <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-gray">🎓 {quiz.grade}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => togglePublish(quiz._id)} 
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${quiz.isPublished ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                    title={quiz.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {quiz.isPublished ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <Link 
                    to={`/teacher/edit/${quiz._id}`} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition-all"
                    title="Edit Quiz"
                  >
                    <Edit size={20} />
                  </Link>
                  <button 
                    onClick={() => deleteQuiz(quiz._id)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-error hover:bg-error/10 transition-all"
                    title="Delete Quiz"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <Link 
                  to={`/teacher/submissions/${quiz._id}`} 
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  <Users size={16} /> Submissions
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
