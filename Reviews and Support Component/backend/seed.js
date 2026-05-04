const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const users = [
    {
        _id: '640f1a2b3c4d5e6f7a8b9c01',
        name: 'John Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'student'
    },
    {
        _id: '640f1a2b3c4d5e6f7a8b9c02',
        name: 'Prof. Smith',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher'
    },
    {
        _id: '640f1a2b3c4d5e6f7a8b9c03',
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users only if specifically needed, but here we'll use findOneAndUpdate to avoid duplicates
        for (const user of users) {
             await User.findByIdAndUpdate(user._id, user, { upsert: true, new: true });
        }

        console.log('Seeding completed! 3 simulation users (Student, Teacher, Admin) are ready.');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
