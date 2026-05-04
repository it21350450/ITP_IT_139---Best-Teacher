import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, CheckCircle, XCircle, Award, User, BookOpen, Clock, AlertCircle } from 'lucide-react';

const SubmissionDetails = ({ user, isResult = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradingPoints, setGradingPoints] = useState({});

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const res = await axios.get(`/api/submissions/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setData(res.data);
      
      // Initialize grading points for manual grading
      const pointsMap = {};
      res.data.submission.answers.forEach(a => {
        pointsMap[a.questionId] = a.awardedPoints;
      });
      setGradingPoints(pointsMap);
    } catch (err) {
      console.error(err);
      alert('Error fetching submission details');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeUpdate = async (qId, maxPoints) => {
    const points = gradingPoints[qId];
    if (points < 0 || points > maxPoints) {
      alert(`Points must be between 0 and ${maxPoints}`);
      return;
    }

    try {
      await axios.patch(`/api/submissions/${id}/grade`, {
        questionId: qId,
        awardedPoints: points
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchSubmission(); // Refresh to update total score
    } catch (err) {
      alert('Error updating grade');
    }
  };

  if (loading) return <div className="text-center py-20">Loading submission...</div>;
  if (!data) return null;

  const { submission, questions } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(isResult ? '/student' : `/teacher/submissions/${submission.quizId._id}`)}
        className="btn btn-secondary mb-8"
      >
        <ChevronLeft size={18} /> Back to {isResult ? 'Dashboard' : 'All Submissions'}
      </button>

      {/* Result Card */}
      <div className="glass-card mb-8 overflow-hidden relative">
        <div className="flex justify-between items-center z-10 relative">
          <div>
             <h2 className="text-3xl font-bold mb-2">{isResult ? 'Quiz Result' : 'Student Submission'}</h2>
             <div className="flex gap-4 text-text-gray">
                <span className="flex items-center gap-1"><BookOpen size={16} /> {submission.quizId.title}</span>
                <span className="flex items-center gap-1"><User size={16} /> {submission.studentId.name}</span>
                <span className="flex items-center gap-1"><Clock size={16} /> {new Date(submission.submittedAt).toLocaleString()}</span>
             </div>
          </div>
          <div className="text-center bg-primary/20 p-6 rounded-2xl border border-primary/30 min-w-[150px]">
            <span className="text-text-gray text-xs uppercase tracking-widest block mb-1">Total Score</span>
            <div className="text-5xl font-black text-primary decoration-primary underline underline-offset-8">
              {submission.score}
            </div>
            <span className="text-sm font-medium mt-2 block">/ {questions.reduce((sum, q) => sum + q.points, 0)} Pts</span>
          </div>
        </div>
        
        {/* Visual score accent */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${(submission.score / questions.reduce((sum, q) => sum + q.points, 0)) * 100}%` }}></div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold px-2">Responses Breakdown</h3>
        {questions.map((q, idx) => {
          const studentAns = submission.answers.find(a => a.questionId === q._id);
          const isCorrect = q.type !== 'SHORT_ANSWER' && studentAns?.response.toLowerCase() === q.correctAnswer.toLowerCase();
          
          return (
            <div key={q._id} className={`glass-card border-l-4 ${isCorrect ? 'border-l-success' : (q.type === 'SHORT_ANSWER' ? 'border-l-warning' : 'border-l-error')}`}>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold opacity-60">Question {idx + 1} ({q.type})</span>
                <div className="flex items-center gap-3">
                  {q.type !== 'SHORT_ANSWER' && (
                    isCorrect ? <span className="text-success flex items-center gap-1 font-bold text-sm"><CheckCircle size={16} /> Correct</span> 
                             : <span className="text-error flex items-center gap-1 font-bold text-sm"><XCircle size={16} /> Incorrect</span>
                  )}
                  <span className="badge badge-secondary">{studentAns?.awardedPoints} / {q.points} Pts</span>
                </div>
              </div>

              <h4 className="text-lg font-medium mb-4">{q.questionText}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-4 rounded-xl border border-glass-border">
                  <p className="text-xs text-text-gray uppercase mb-2">Student's Answer</p>
                  <p className="font-medium text-white">{studentAns?.response || '(No Answer)'}</p>
                </div>
                {(!isResult || q.type !== 'SHORT_ANSWER') && (
                  <div className="bg-white/5 p-4 rounded-xl border border-glass-border">
                    <p className="text-xs text-text-gray uppercase mb-2">Correct Answer / Reference</p>
                    <p className="font-medium text-success">{q.correctAnswer}</p>
                  </div>
                )}
              </div>

              {/* Manual Grading for Teachers */}
              {user.role === 'teacher' && q.type === 'SHORT_ANSWER' && (
                <div className="mt-6 pt-6 border-t border-glass-border flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-text-gray mb-2 block">Grade this Answer (0 to {q.points})</label>
                    <input 
                       type="number"
                       max={q.points}
                       min="0"
                       value={gradingPoints[q._id] || 0}
                       onChange={(e) => setGradingPoints({...gradingPoints, [q._id]: parseInt(e.target.value)})}
                    />
                  </div>
                  <button onClick={() => handleGradeUpdate(q._id, q.points)} className="btn btn-primary">Update Points</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {isResult && submission.graded && (
        <div className="mt-12 text-center p-10 bg-success/10 rounded-3xl border border-success/20">
           <Award className="text-success mx-auto mb-4" size={60} />
           <h2 className="text-2xl font-bold">Great Job!</h2>
           <p className="text-text-gray">Your submission has been finalized and graded. Your score is recorded in the platform.</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetails;
