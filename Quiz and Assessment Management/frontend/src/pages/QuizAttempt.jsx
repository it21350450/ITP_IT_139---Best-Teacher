import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Clock, ChevronLeft, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';

const QuizAttempt = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // Optional timer

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuiz(res.data);
      // Initialize blank answers
      const initialAnswers = res.data.questions.map(q => ({
        questionId: q._id,
        response: ''
      }));
      setAnswers(initialAnswers);
    } catch (err) {
      alert('Error fetching quiz details');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (response) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex].response = response;
    setAnswers(updatedAnswers);
  };

  const submitQuiz = async () => {
    const unansweredCount = answers.filter(a => !a.response).length;
    let confirmMsg = 'Are you sure you want to submit your answers?';
    
    if (unansweredCount > 0) {
      confirmMsg = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`;
    }

    if (!window.confirm(confirmMsg)) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quizzes/${id}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate(`/student/result/${res.data.submission._id}`);
    } catch (err) {
      alert('Error submitting quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl font-bold">Preparing Your Assessment...</div>;
  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-8 glass-card" style={{ padding: '1rem 2rem' }}>
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <p className="text-text-gray text-sm">{quiz.subject} • {quiz.questions.length} Questions</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
             <Clock size={24} /> {new Date(quiz.deadline).toLocaleDateString()}
          </div>
          <span className="text-xs text-text-gray uppercase tracking-widest">Deadline</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-glass h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="glass-card min-h-[400px] flex flex-col justify-between mb-8 relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <HelpCircle size={150} />
        </div>

        <div className="z-10">
          <div className="flex justify-between items-center mb-10">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span className="badge badge-secondary">{currentQuestion.points} Points</span>
          </div>

          <h3 className="text-3xl font-medium mb-12">{currentQuestion.questionText}</h3>

          <div className="space-y-4">
            {currentQuestion.type === 'MCQ' || currentQuestion.type === 'TRUE_FALSE' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, i) => (
                  <label 
                    key={i} 
                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all ${answers[currentIndex].response === opt ? 'border-primary bg-primary/10' : 'border-glass-border bg-glass hover:bg-white/5'}`}
                  >
                    <input 
                      type="radio" 
                      className="hidden"
                      checked={answers[currentIndex].response === opt}
                      onChange={() => handleAnswerChange(opt)}
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${answers[currentIndex].response === opt ? 'border-primary bg-primary' : 'border-text-gray'}`}>
                      {answers[currentIndex].response === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-lg">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-gray">Your Answer</label>
                <textarea 
                  rows="6"
                  className="text-lg p-5"
                  placeholder="Type your answer here..."
                  value={answers[currentIndex].response}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                ></textarea>
                <div className="flex items-center gap-2 text-xs text-text-gray mt-2">
                  <AlertCircle size={14} /> Short answers will be graded manually by your teacher.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-glass-border">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="btn btn-secondary disabled:opacity-30"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {currentIndex === quiz.questions.length - 1 ? (
            <button 
              onClick={submitQuiz}
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Submitting...' : <><Send size={20} /> Finish & Submit</>}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="btn btn-primary"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Navigation Dots */}
      <div className="flex justify-center gap-2">
        {quiz.questions.map((_, i) => (
          <div 
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === i ? 'bg-primary scale-125' : (answers[i].response ? 'bg-success/50' : 'bg-glass')}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default QuizAttempt;
