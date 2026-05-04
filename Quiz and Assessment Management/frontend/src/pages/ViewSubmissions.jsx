import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, User, Calendar, Award, ExternalLink, Search } from 'lucide-react';

const ViewSubmissions = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${id}/submissions`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-20">Loading submissions...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate('/teacher')} className="btn btn-secondary mb-8">
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-2">Quiz Submissions</h2>
          <p className="text-text-gray">Results for quiz ID: {id}</p>
        </div>
        <div className="relative w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray" size={18} />
           <input 
             className="pl-10" 
             placeholder="Search student name..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="glass-card shadow-xl overflow-hidden" style={{ padding: 0 }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-text-gray text-sm uppercase tracking-wider">
              <th className="p-5 font-bold">Student</th>
              <th className="p-5 font-bold">Submission Date</th>
              <th className="p-5 font-bold text-center">Auto Score</th>
              <th className="p-5 font-bold text-center">Status</th>
              <th className="p-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-text-gray">No submissions found.</td>
              </tr>
            ) : (
              filteredSubmissions.map(s => (
                <tr key={s._id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {s.studentId.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{s.studentId.name}</div>
                        <div className="text-xs text-text-gray">{s.studentId.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-text-gray">
                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(s.submittedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-1 font-bold text-lg">
                      <Award size={18} className="text-primary" /> {s.score}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`badge ${s.graded ? 'badge-success' : 'badge-warning'}`}>
                      {s.graded ? 'Graded' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <Link to={`/student/result/${s._id}`} className="btn btn-secondary btn-sm p-2 hover:bg-primary hover:text-white border-none">
                      <ExternalLink size={18} /> Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewSubmissions;
