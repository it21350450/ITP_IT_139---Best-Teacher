const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false // Do not return by default
        },
        role: {
            type: String,
            enum: ['student', 'teacher', 'admin'],
            required: [true, 'Role is required']
        },
        contactNumber: {
            type: String,
            required: [true, 'Please add a contact number']
        },
        profilePicture: {
            type: String,
            default: 'default.jpg'
        },
        
        // Student specific fields
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        grade: { type: String },
        schoolName: { type: String },
        subjectsInterested: [{ type: String }],

        // Teacher specific fields
        qualification: { type: String },
        teachingSubjects: [{ type: String }],
        yearsOfExperience: { type: Number },
        institution: { type: String },
        availabilitySchedule: [{ type: String }]
    },
    {
        timestamps: true // Adds createdAt and updatedAt automatically
    }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
