const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Student: Submit answers for quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    const studentId = req.user.id;

    // 1. Check if quiz exists and is published
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ message: 'Quiz not found or not published.' });
    }

    // 2. Check deadline
    if (new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ message: 'Deadline has passed. Submissions are closed.' });
    }

    // 3. Prevent multiple submissions
    const existingSubmission = await Submission.findOne({ quizId, studentId });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this quiz.' });
    }

    // 4. Fetch questions for auto-grading
    const questions = await Question.find({ quizId });
    let totalScore = 0;
    const gradedAnswers = [];

    for (const q of questions) {
      const studentAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
      let awardedPoints = 0;

      if (studentAnswer) {
        if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
          const res1 = (studentAnswer.response || '').trim().toLowerCase();
          const res2 = (q.correctAnswer || '').trim().toLowerCase();
          if (res1 === res2 && res2 !== '') {
            awardedPoints = q.points;
          }
        }
        // Short Answer is left for manual grading, awardedPoints remains 0 initially
        
        gradedAnswers.push({
          questionId: q._id,
          response: studentAnswer.response,
          awardedPoints: awardedPoints
        });

        totalScore += awardedPoints;
      } else {
        // Missing answer
        gradedAnswers.push({
          questionId: q._id,
          response: '',
          awardedPoints: 0
        });
      }
    }

    // Check if there are short answers to determine if fully graded
    const hasShortAnswer = questions.some(q => q.type === 'SHORT_ANSWER');

    const submission = new Submission({
      quizId,
      studentId,
      answers: gradedAnswers,
      score: totalScore,
      graded: !hasShortAnswer // If no short answers, it's auto-graded
    });

    await submission.save();

    res.status(201).json({
      message: 'Quiz submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

// Teacher: View all student submissions for a quiz
exports.getQuizSubmissions = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const submissions = await Submission.find({ quizId }).populate('studentId', 'name email');
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get Quiz Submissions Error:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

// Teacher: View a specific submission
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('quizId', 'title');
    
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Check if requester is teacher of this quiz or the student who submitted
    const quiz = await Quiz.findById(submission.quizId);
    
    // Safety check for populated but missing user records
    const studentIdString = submission.studentId?._id?.toString() || submission.studentId?.toString();

    if (quiz.teacherId.toString() !== req.user.id && studentIdString !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Include questions for context
    const questions = await Question.find({ quizId: submission.quizId });

    res.status(200).json({
      submission,
      questions
    });
  } catch (error) {
    console.error('Get Submission Detail Error:', error);
    res.status(500).json({ message: 'Error fetching submission details', error: error.message });
  }
};

// Teacher: Adjust grade manually
exports.adjustGrade = async (req, res) => {
  try {
    const { questionId, awardedPoints } = req.body;
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const quiz = await Quiz.findById(submission.quizId);
    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const answer = submission.answers.find(a => a.questionId.toString() === questionId);
    if (!answer) return res.status(404).json({ message: 'Answer for this question not found in submission' });

    // Update awarded points for that specific question
    const pointDiff = awardedPoints - answer.awardedPoints;
    answer.awardedPoints = awardedPoints;
    submission.score += pointDiff;
    submission.graded = true; // Mark as graded if teacher manually touches it

    await submission.save();

    res.status(200).json({ message: 'Grade adjusted successfully', submission });
  } catch (error) {
    console.error('Adjust Grade Error:', error);
    res.status(500).json({ message: 'Error adjusting grade', error: error.message });
  }
};
// Student: Get my own submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const submissions = await Submission.find({ studentId })
      .populate('quizId', 'title subject grade')
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get My Submissions Error:', error);
    res.status(500).json({ message: 'Error fetching your submissions', error: error.message });
  }
};
