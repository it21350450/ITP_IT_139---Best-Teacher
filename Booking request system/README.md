# Best Teacher - Booking Request System

This project is a fully-featured **Booking Request System** built for the "Best Teacher" platform. It allows students to request lessons from specific teachers and provides dedicated dashboards for both students and teachers to manage the lifecycle of these lesson bookings.

## 🚀 Technology Stack

**Frontend:**
- **React.js** (built with Vite for fast performance)
- **Material UI (MUI)** for premium, modern, and responsive UI components
- **Axios** for robust API communication
- **React Context API** for global state management (Booking state)

**Backend:**
- **Node.js** with **Express.js** for the RESTful API backend
- **MongoDB** with **Mongoose** for schema-based data modeling
- **Dotenv** for environment variable management
- **Cors** for cross-origin resource sharing

---

## ✨ Key Features

- **Role-Based Access Simulation:** Easily toggle between "Student" and "Teacher" views via the top navigation bar to test out both sides of the platform.
- **Smart Teacher Selection:** Students can view a list of available teachers and filter them dynamically based on **Subject** and **Module**.
- **Conflict Prevention:** The backend checks and prevents overlapping bookings for the same teacher.
- **Dynamic Booking Lifecycle:** Statuses can transition between `Pending`, `Confirmed`, `Cancelled`, and `Completed` with strict role-based validation.
- **Rich Dashboard:** Interactive UI utilizing Material UI data cards, chips, and steppers to guide the user seamlessly through tasks.

---

## 🔄 Detailed Application Flow

### 👨‍🎓 Student Flow
1. **Dashboard Overview:** Upon entering, the student sees their "My Learning Schedule" which displays all past, present, and pending lesson requests.
2. **Find a Teacher:** The student clicks **"Book a Lesson"**. A beautifully designed Teacher Selection screen appears.
3. **Filtering:** The student can filter teachers by specific Subjects (e.g., Mathematics, Computer Science) or Modules (e.g., Algebra, Data Structures).
4. **Selecting a Slot:** Once a teacher is selected, the student is presented with a booking form to select a future Date, Start Time, End Time, and an optional message.
5. **Submission:** The system ensures the times do not conflict with the teacher's existing schedule. If valid, the request is marked as **Pending** and added to the dashboard.
6. **Student Management:** Students can cancel their own pending/confirmed requests, or update the details of a pending request before the teacher confirms it.

### 👩‍🏫 Teacher Flow
1. **Dashboard Overview:** The teacher views their "Teacher Dashboard" which lists all incoming lesson requests.
2. **Request Review:** The teacher reviews details of a **Pending** request (time, student name, message).
3. **Actioning Requests:**
   - **Confirm:** The teacher accepts the lesson. The status updates to **Confirmed**.
   - **Cancel:** The teacher rejects the lesson and must provide a cancellation reason.
4. **Completion:** Once a confirmed lesson is finished, the teacher can mark the status as **Completed**.

---

## 📁 Project Structure

```text
Booking request system/
├── backend/                  # Node.js Express API
│   ├── controllers/          # Business logic (bookingController, teacherController)
│   ├── middleware/           # Error handling and validation (errorMiddleware, bookingValidation)
│   ├── models/               # Mongoose schemas (Booking, User)
│   ├── routes/               # API endpoints (/api/bookings, /api/teachers)
│   ├── server.js             # Main server entry point
│   └── package.json          # Backend dependencies
│
└── frontend/                 # React Vite Application
    ├── src/
    │   ├── components/       # Reusable UI parts (TeacherSelection, BookingRequestForm, etc.)
    │   ├── context/          # React Context (BookingContext)
    │   ├── pages/            # Page layouts (MyBookingsPage)
    │   ├── services/         # Axios API clients (bookingService)
    │   ├── App.jsx           # Main Frontend routing and layout
    │   └── main.jsx          # React DOM entry point
    ├── vite.config.js        # Vite configuration & proxy settings
    └── package.json          # Frontend dependencies
```

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (if not already present):
   - Create a `.env` file in the `/backend` folder.
   - Add the following variables:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/best-teacher
     ```
     *(Ensure you have MongoDB running locally, or replace the URI with your MongoDB Atlas cluster URI).*
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The application will typically launch on `http://localhost:3000` (or another port provided by Vite). The frontend API calls are automatically proxied to the backend running on `http://localhost:5000`.

---

## 🎲 Mock Data Seeding
The backend handles mock data automatically to make testing easier:
- When the `/api/teachers` endpoint is called for the first time, it checks for existing teachers. If none exist, it automatically seeds the database with **3 mock teachers** with various subjects and modules for testing.
- The `App.jsx` handles mock "Student" and "Teacher" role toggling dynamically by injecting `x-mock-role` headers into the API requests, bypassing complex JWT authentication for immediate testing.
