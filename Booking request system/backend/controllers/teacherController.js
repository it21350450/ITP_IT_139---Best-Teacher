const User = require('../models/User');
const mongoose = require('mongoose');

exports.getTeachers = async (req, res, next) => {
  try {
    const { subject, module } = req.query;
    
    // Seed mock teachers if none exist
    const mockTeacherId = '651edc4e1a2b3c4d5e6f7a8b';
    let teacher = await User.findById(mockTeacherId);
    if (!teacher) {
       teacher = new User({
          _id: mockTeacherId,
          name: 'Mr. Smith (Mock)',
          email: 'smith@example.com',
          role: 'teacher',
          subjects: ['Mathematics', 'Physics'],
          modules: ['Algebra', 'Mechanics', 'Calculus']
       });
       await teacher.save();

       const teacher2 = new User({
          _id: new mongoose.Types.ObjectId(),
          name: 'Mrs. Davis',
          email: 'davis@example.com',
          role: 'teacher',
          subjects: ['English', 'History'],
          modules: ['Grammar', 'World War II', 'Literature']
       });
       await teacher2.save();
       
       const teacher3 = new User({
          _id: new mongoose.Types.ObjectId(),
          name: 'Dr. John',
          email: 'john@example.com',
          role: 'teacher',
          subjects: ['Computer Science', 'Mathematics'],
          modules: ['Algorithms', 'Data Structures', 'Calculus']
       });
       await teacher3.save();
    }

    let query = { role: 'teacher' };
    
    if (subject) {
      // Case-insensitive regex match
      query.subjects = { $regex: new RegExp(subject, 'i') };
    }
    if (module) {
      query.modules = { $regex: new RegExp(module, 'i') };
    }

    const teachers = await User.find(query);

    // Also get all unique subjects and modules to populate the filters
    const allTeachers = await User.find({ role: 'teacher' });
    let allSubjects = new Set();
    let allModules = new Set();
    allTeachers.forEach(t => {
      if (t.subjects) t.subjects.forEach(s => allSubjects.add(s));
      if (t.modules) t.modules.forEach(m => allModules.add(m));
    });

    res.status(200).json({
      success: true,
      data: teachers,
      filters: {
        subjects: Array.from(allSubjects),
        modules: Array.from(allModules)
      }
    });
  } catch (error) {
    next(error);
  }
};
