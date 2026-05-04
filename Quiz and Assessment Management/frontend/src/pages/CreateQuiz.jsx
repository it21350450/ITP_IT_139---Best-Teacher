import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X, HelpCircle, CheckCircle } from 'lucide-react';

const CreateQuiz = ({ user, isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    deadline: '',
    questions: [
      { type: 'MCQ', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 5 }
    ]
  });

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      fetchQuiz();
    }
  }, [id, isEdit]);

  //validations
  const validateForm = () => {
    const newErrors = {};
    if (!quizData.title.trim()) newErrors.title = 'Title is required';
    if (!quizData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!quizData.grade.trim()) newErrors.grade = 'Grade is required';
    if (!quizData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(quizData.deadline);
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }
    
    quizData.questions.forEach((q, idx) => {
      if (!q.questionText.trim()) {
        newErrors[`q${idx}_text`] = 'Question text is required';
      }
      if ((q.type === 'MCQ' || q.type === 'TRUE_FALSE') && !q.correctAnswer) {
        newErrors[`q${idx}_answer`] = 'Correct answer must be selected';
      }
      if (q.type === 'MCQ') {
        q.options.forEach((opt, oIdx) => {
          if (!opt.trim()) newErrors[`q${idx}_o${oIdx}`] = 'Option cannot be empty';
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // The backend returns formatted quiz, we might need to adjust dates
      const data = res.data;
      data.deadline = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';
      setQuizData(data);
    } catch (err) {
      console.error('Error fetching quiz', err);
    }
  };

  const addQuestion = (type = 'MCQ') => {
    const newQuestion = {
      type: type,
      questionText: '',
      options: type === 'MCQ' ? ['', '', '', ''] : (type === 'TRUE_FALSE' ? ['True', 'False'] : []),
      correctAnswer: '',
      points: 5
    };
    setQuizData({ ...quizData, questions: [...quizData.questions, newQuestion] });
    setSelectedQuestionIndex(quizData.questions.length);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
    
    // Clear error if fixing
    if (errors[`q${index}_text`] || errors[`q${index}_answer`]) {
      const newErrors = { ...errors };
      delete newErrors[`q${index}_text`];
      delete newErrors[`q${index}_answer`];
      setErrors(newErrors);
    }
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
    
    // Clear error if fixing
    if (errors[`q${qIndex}_o${oIndex}`]) {
      const newErrors = { ...errors };
      delete newErrors[`q${qIndex}_o${oIndex}`];
      setErrors(newErrors);
    }
  };

  const deleteQuestion = (index) => {
    if (quizData.questions.length === 1) return alert('Quiz must have at least one question.');
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
    if (selectedQuestionIndex >= updatedQuestions.length) {
      setSelectedQuestionIndex(updatedQuestions.length - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors before saving.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (isEdit) {
        await axios.put(`/api/quizzes/${id}`, quizData, config);
      } else {
        await axios.post('/api/quizzes', quizData, config);
      }
      navigate('/teacher');
    } catch (err) {
      alert('Error saving quiz: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/teacher')} className="btn btn-secondary"><X size={18} /> Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary"><Save size={18} /> {isEdit ? 'Update' : 'Save'} Quiz</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar: Question List */}
        <div className="col-span-4">
          <div className="glass-card sticky top-8">
            <h4 className="mb-4">Questions ({quizData.questions.length})</h4>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto mb-6 pr-2">
              {quizData.questions.map((q, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition ${selectedQuestionIndex === idx ? 'bg-primary text-white' : 'bg-glass hover:bg-white/10'}`}
                >
                  <span className="truncate flex-1">Q{idx + 1}: {q.questionText || '(Empty Question)'}</span>
                  {selectedQuestionIndex === idx && <Trash2 size={16} className="ml-2 hover:scale-125" onClick={(e) => { e.stopPropagation(); deleteQuestion(idx); }} />}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => addQuestion('MCQ')} className="btn btn-secondary w-full text-sm py-2"><Plus size={16} /> Add MCQ</button>
              <button onClick={() => addQuestion('TRUE_FALSE')} className="btn btn-secondary w-full text-sm py-2"><Plus size={16} /> Add True/False</button>
              <button onClick={() => addQuestion('SHORT_ANSWER')} className="btn btn-secondary w-full text-sm py-2"><Plus size={16} /> Add Short Ans</button>
            </div>
          </div>
        </div>

        {/* Main: Question Editor */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* General Info */}
          <div className="glass-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label>Quiz Title</label>
                <input 
                  value={quizData.title} 
                  onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                  placeholder="e.g. Midterm Physics Assessment" 
                  className={errors.title ? 'border-error' : ''}
                />
                {errors.title && <span className="text-error text-xs">{errors.title}</span>}
              </div>
              <div className="col-span-2">
                <label>Description</label>
                <textarea 
                  rows="2"
                  value={quizData.description} 
                  onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                  placeholder="Describe the quiz goals..."
                ></textarea>
              </div>
              <div>
                <label>Subject</label>
                <input 
                  value={quizData.subject} 
                  onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
                  placeholder="e.g. Physics" 
                  className={errors.subject ? 'border-error' : ''}
                />
                {errors.subject && <span className="text-error text-xs">{errors.subject}</span>}
              </div>
              <div>
                <label>Grade Level</label>
                <select 
                  value={quizData.grade} 
                  onChange={(e) => setQuizData({...quizData, grade: e.target.value})}
                  className={errors.grade ? 'border-error' : ''}
                >
                  <option value="">Select Grade</option>
                  {[6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                    <option key={num} value={`Grade ${num}`}>Grade {num}</option>
                  ))}
                </select>
                {errors.grade && <span className="text-error text-xs">{errors.grade}</span>}
              </div>
              <div className="col-span-2">
                <label>Submission Deadline</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={quizData.deadline} 
                  onChange={(e) => setQuizData({...quizData, deadline: e.target.value})}
                  className={errors.deadline ? 'border-error' : ''}
                />
                {errors.deadline && <span className="text-error text-xs">{errors.deadline}</span>}
              </div>
            </div>
          </div>

          {/* Active Question Editor */}
          {quizData.questions[selectedQuestionIndex] && (
            <div className="glass-card border-l-4 border-l-primary">
              <div className="flex justify-between items-center mb-4">
                <span className="badge badge-success">Editing Question {selectedQuestionIndex + 1}</span>
                <span className="text-sm font-medium">Type: {quizData.questions[selectedQuestionIndex].type}</span>
              </div>
              
              <div className="mb-4">
                <label>Question Text</label>
                <input 
                  value={quizData.questions[selectedQuestionIndex].questionText}
                  onChange={(e) => updateQuestion(selectedQuestionIndex, 'questionText', e.target.value)}
                  placeholder="Type your question here..."
                  className={`text-lg font-medium ${errors[`q${selectedQuestionIndex}_text`] ? 'border-error' : ''}`}
                />
                {errors[`q${selectedQuestionIndex}_text`] && <span className="text-error text-xs">{errors[`q${selectedQuestionIndex}_text`]}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label>Assign Points</label>
                  <input 
                    type="number"
                    value={quizData.questions[selectedQuestionIndex].points}
                    onChange={(e) => updateQuestion(selectedQuestionIndex, 'points', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Options for MCQ / TRUE_FALSE */}
              {(quizData.questions[selectedQuestionIndex].type === 'MCQ' || quizData.questions[selectedQuestionIndex].type === 'TRUE_FALSE') && (
                <div className="mb-6">
                  <label className="mb-2 block">Options (Select the correct one)</label>
                  {errors[`q${selectedQuestionIndex}_answer`] && <div className="text-error text-xs mb-2">{errors[`q${selectedQuestionIndex}_answer`]}</div>}
                  <div className="grid gap-3">
                    {quizData.questions[selectedQuestionIndex].options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex flex-col gap-1">
                        <div className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            name={`correct-${selectedQuestionIndex}`}
                            className="w-5 h-5 cursor-pointer accent-primary"
                            checked={quizData.questions[selectedQuestionIndex].correctAnswer === opt && opt !== ''}
                            onChange={() => updateQuestion(selectedQuestionIndex, 'correctAnswer', opt)}
                          />
                          <input 
                            value={opt}
                            onChange={(e) => updateOption(selectedQuestionIndex, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className={errors[`q${selectedQuestionIndex}_o${oIdx}`] ? 'border-error' : (quizData.questions[selectedQuestionIndex].correctAnswer === opt && opt !== '' ? 'border-primary' : '')}
                            disabled={quizData.questions[selectedQuestionIndex].type === 'TRUE_FALSE'}
                          />
                        </div>
                        {errors[`q${selectedQuestionIndex}_o${oIdx}`] && <span className="text-error text-xs ml-8">{errors[`q${selectedQuestionIndex}_o${oIdx}`]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* For Short Answer */}
              {quizData.questions[selectedQuestionIndex].type === 'SHORT_ANSWER' && (
                <div className="mb-6">
                  <label>Correct Answer Placeholder (Optional - for teacher reference)</label>
                  <input 
                    value={quizData.questions[selectedQuestionIndex].correctAnswer}
                    onChange={(e) => updateQuestion(selectedQuestionIndex, 'correctAnswer', e.target.value)}
                    placeholder="Type expected answer keywords..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
