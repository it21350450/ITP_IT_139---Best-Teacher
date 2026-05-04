const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Teacher: Create a new quiz with questions
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, subject, grade, deadline, questions } = req.body;
    const teacherId = req.user.id; // Assuming user id is available via auth middleware

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'Quiz must contain at least one question.' });
    }

    const quiz = new Quiz({
      teacherId,
      title,
      description,
      subject,
      grade,
      deadline,
      isPublished: false
    });

    const savedQuiz = await quiz.save();

    // Save questions
    const questionDocs = questions.map(q => ({
      ...q,
      quizId: savedQuiz._id
    }));

    await Question.insertMany(questionDocs);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: savedQuiz
    });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
};

// Teacher: Get all quizzes created by the logged-in teacher
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const quizzes = await Quiz.find({ teacherId }).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get Teacher Quizzes Error:', error);
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
};

// Student: List all published quizzes that have not passed deadline
exports.getAvailableQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await Quiz.find({
      isPublished: true,
      deadline: { $gt: now }
    }).sort({ deadline: 1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get Available Quizzes Error:', error);
    res.status(500).json({ message: 'Error fetching available quizzes', error: error.message });
  }
};

// Common: Get quiz details with questions
exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId: quiz._id });
    
    // If student is requesting, hide correct answers? 
    // Usually, we hide correct answers until after submission.
    const sanitizedQuestions = questions.map(q => {
      const qObj = q.toObject();
      if (req.user.role === 'student') {
        delete qObj.correctAnswer;
      }
      return qObj;
    });

    res.status(200).json({
      ...quiz.toObject(),
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Get Quiz Details Error:', error);
    res.status(500).json({ message: 'Error fetching quiz details', error: error.message });
  }
};

// Teacher: Update quiz details before publishing
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (quiz.isPublished) {
      return res.status(400).json({ message: 'Cannot edit a published quiz. Unpublish it first.' });
    }

    const { title, description, subject, grade, deadline, questions } = req.body;

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.subject = subject || quiz.subject;
    quiz.grade = grade || quiz.grade;
    quiz.deadline = deadline || quiz.deadline;

    await quiz.save();

    // If questions are provided, update them (this is a simplified logic: delete and recreate)
    if (questions && questions.length > 0) {
      await Question.deleteMany({ quizId: quiz._id });
      const questionDocs = questions.map(q => ({
        ...q,
        quizId: quiz._id
      }));
      await Question.insertMany(questionDocs);
    }

    res.status(200).json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Update Quiz Error:', error);
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
};

// Teacher: Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
};

// Teacher: Publish or unpublish quiz
exports.togglePublish = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.status(200).json({
      message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: quiz.isPublished
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling publish status', error: error.message });
  }
};
