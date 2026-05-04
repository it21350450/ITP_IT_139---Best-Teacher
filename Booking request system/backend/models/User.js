const mongoose = require('mongoose');

// Extremely simple mocked User schema just to satisfy Mongoose `.populate()` calls 
// since the original prompt asked NOT to build the actual User authentication module.
const userSchema = new mongoose.Schema({
  name: { type: String, default: 'Mock User' },
  email: { type: String, default: 'mock@example.com' },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  subjects: [{ type: String }],
  modules: [{ type: String }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
