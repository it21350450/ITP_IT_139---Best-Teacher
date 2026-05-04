# 🎓 Best Teacher Platform - Quiz & Assessment Management

A high-performance, professional academic assessment system designed to streamline the connection between teachers and students. Built with the **MERN** stack (MongoDB, Express, React, Node.js), this platform features a modern **Glassmorphism UI**, sophisticated grading logic, and comprehensive analytics.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Application Flow (User Journey)](#-application-flow-user-journey)
  - [Teacher Flow](#1-teacher-flow)
  - [Student Flow](#2-student-flow)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database & Models](#-database--models)
- [Robust Validations](#-robust-validations)
- [How to Run the Project](#-how-to-run-the-project)
- [API Overview](#-api-overview)

---

## 🌟 Overview

The **Quiz & Assessment Management** module is a core part of the Best Teacher Platform. It enables educators to seamlessly design, distribute, and evaluate tests, while providing students with an intuitive environment to attempt quizzes and view performance insights.

The platform relies on a sophisticated auto-grading engine for objective questions (MCQ, True/False) and a streamlined manual grading interface for descriptive questions (Short Answer).

---

## 🔄 Application Flow (User Journey)

### 1. Teacher Flow
1. **Authentication:** The teacher logs into the platform (or uses the mock role-encoded token for dev testing).
2. **Dashboard Overview:** Upon entry, the teacher is greeted by the `TeacherDashboard`, which displays a list of all active, upcoming, and past quizzes.
3. **Quiz Creation (`CreateQuiz`):**
   - The teacher navigates to the quiz creator.
   - Enters basic details (Title, Subject, Grade Level, Deadline).
   - Dynamically adds questions of various types:
     - **Multiple Choice:** Adds options and flags the correct one.
     - **True/False:** Selects the valid boolean state.
     - **Short Answer:** Sets the maximum points to be awarded during manual review.
   - Validates and saves the quiz to the database.
4. **Monitoring & Review (`ViewSubmissions`):** 
   - Once students attempt the quiz, the teacher can view a list of all submissions.
   - Submissions are marked as *Auto-Graded*, *Pending Review* (if there are short answers), or *Graded*.
5. **Manual Grading (`SubmissionDetails`):**
   - The teacher opens a specific student's submission.
   - Reviews the student's text for "Short Answer" questions.
   - Awards points (validated not to exceed the maximum allowed).
   - Finalizes the grading, pushing the final score to the student.

### 2. Student Flow
1. **Authentication:** The student accesses the platform with their student profile.
2. **Student Dashboard (`StudentDashboard`):**
   - Displays all quizzes assigned to them.
   - Shows the status of each quiz: *Available*, *Submitted*, *Missed*, or *Graded*.
   - Includes a **Student Insight** section that provides feedback or performance analytics (e.g., total sum of quiz scores, average performance).
3. **Attempting a Quiz (`QuizAttempt`):**
   - The student clicks an active quiz.
   - The UI guides them through each question.
   - Validations ensure no questions are accidentally skipped before final submission.
   - Upon submission, objective questions are immediately auto-graded by the backend engine.
4. **Viewing Results:**
   - If the quiz was entirely objective, the student sees their grade instantly.
   - If manual review is required, the status changes to *Pending Review*.
   - Once graded by the teacher, the student can view their detailed breakdown.

---

## 🚀 Key Features

### 1. Comprehensive Quiz Creator
Supports three primary question types:
- **MCQ (Multiple Choice)**: Auto-graded instantly.
- **TRUE/FALSE**: High-speed assessment type.
- **SHORT ANSWER**: Allows descriptive responses for manual teacher review.

### 2. Intelligent Grading Logic
- **Auto-Grade Engine**: Instantly calculates scores for objective questions upon submission.
- **Manual Review Interface**: Teachers can view student responses and award specific points for descriptive answers.
- **Dynamic Analytics**: Sum calculation and display of total scores for students.

### 3. Dev-Friendly Auth System
The project uses a **Mock Role-Encoded Token** system for development ease. You can switch between "Teacher" and "Student" roles instantly via the Navigation Bar without needing to manage complex login credentials during testing.

### 4. Premium Aesthetic System
A custom-built CSS utility system in `index.css` provides:
- **Glassmorphism**: Transparent, blurred cards for a modern feel.
- **Interactive States**: Hover effects, scale animations, and glowing buttons.
- **Dark Mode Optimization**: Deep navy backgrounds tailored for focus.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Router, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose.
- **Styling**: Vanilla CSS (Custom Utility System, Glassmorphism).

---

## 🗄️ Database & Models

### Core Models:
- **`User`**: Stores identities and roles (`Teacher`, `Student`).
- **`Quiz`**: The blueprint for assessments (Title, Subject, Deadline, active status).
- **`Question`**: Discrete assessment items linked to a Quiz (Type, Text, Options, Answer, Points).
- **`Submission`**: Records student responses, calculated scores, and grading status (`auto-graded`, `pending_review`, `graded`).

### Data Seeding
Upon the first startup, the server automatically seeds the database with:
- **Mock Teacher**: `Dr. Smith`
- **Mock Student**: `John Doe`
This ensures all relationships (Submissions -> Users) work correctly right out of the box.

---

## 🛡️ Robust Validations

We have implemented multi-layered validation to ensure data integrity and a smooth user experience.

### 📝 Frontend Validations (React)
- **Deadline Protection**: Teachers are physically blocked from picking past dates. The system greys out old dates and validates the logic upon submission.
- **Form Completeness**: Quizzes cannot be saved without a Title, Subject, Grade Level, and at least one complete question.
- **Option Validation**: MCQ questions require all options to be filled and at least one correct answer to be toggled.
- **Submission Shield**: Students are warned if they attempt to submit a quiz with unanswered questions.
- **Points Boundary**: Manual grading is restricted between 0 and the maximum points assigned to the question.

### ⚙️ Backend Validations (Node.js/Express)
- **Schema Enforcement**: Mongoose schemas strictly define data types and mandatory fields (e.g., `questionText`, `points`).
- **Middleware Checks**: Authorization middleware ensures Students cannot access Teacher-only routes (like creating/deleting quizzes).
- **API Protection**: Input sanitization and validation on API endpoints to prevent malicious or malformed data.

---

## 💻 How to Run the Project

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or Atlas URI)

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/best-teacher-quiz
NODE_ENV=development
JWT_SECRET=your_secret_key
```
Start the backend server (runs on port 5000 by default):
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Overview

The backend uses RESTful architecture. Some critical endpoints include:
- `POST /api/quizzes`: Create a new quiz.
- `GET /api/quizzes`: Fetch all available quizzes.
- `POST /api/submissions/:quizId`: Submit a quiz attempt (triggers auto-grading).
- `GET /api/submissions/student/:studentId`: Retrieve all submissions and analytics for a student.
- `PUT /api/submissions/grade/:submissionId`: Submit manual grading for short answers.
