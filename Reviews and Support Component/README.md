# Best Teacher: Reviews & Support Ecosystem

A high-performance, production-ready MERN stack module designed for the "Best Teacher" platform. This system facilitates transparent feedback between students and teachers and provides a robust ticket-based support infrastructure for resolving platform issues. It also includes comprehensive user search and advanced filtering mechanisms.

---

## 🌟 Pro-Simulation Mode
To facilitate seamless testing and demonstration without a complex authentication setup, this project includes a **Simulation Toolbar** at the top of the interface. This allows you to instantly switch identities:

*   👩‍🎓 **John Student**: Can browse teachers, write and post validated reviews for specific teachers, raise support tickets, and view ticket threads.
*   👨‍🏫 **Prof. Smith**: Can view a dedicated "My Profile" dashboard showing all student reviews and their average rating. Can view student inquiries directed to them, respond to issues, update ticket statuses, and raise tickets to Admin.
*   🛡️ **System Admin**: Can view all platform tickets, manage inappropriate content, resolve complex issues, and directly message both teachers and students.

---

## 🔄 Application Flow (User Journeys)

### Student Flow
1. **Finding Teachers & Writing Reviews**: A student navigates to "Write Review". They select a specific teacher from a dynamically populated dropdown list fetched directly from the database. After selecting a teacher, they provide a star rating and a comment, which instantly updates the teacher's profile.
2. **Raising a Support Ticket**: If a student faces an issue, they navigate to "Support". They select "Teacher" or "Admin" as the recipient. If they choose "Teacher", a dynamically loaded dropdown allows them to find and select the specific teacher. They submit the ticket and can track it on the "My Tickets" dashboard.

### Teacher Flow
1. **Review Dashboard**: Teachers can access "My Profile" to see a comprehensive summary of all reviews they've received from students, including an aggregated average rating and a list of feedback sorted by newest first.
2. **Handling Inquiries**: Teachers visit "Student Inquiries" to see tickets assigned to them. They can filter these tickets by status (e.g., Open, In Progress, Closed). They can respond to threads and update the status of the ticket to "Resolved" once handled.

### Admin Flow
1. **Platform Moderation**: Admins have an "All Tickets" view to oversee platform activity. They can intervene in disputes or assist with technical issues.
2. **Direct Messaging (Proactive Support)**: Admins can navigate to "Message Users" (Create Ticket) and select either "Teacher" or "Student" from the role dropdown. They then select the specific user from the dynamically loaded list and send a message. This creates a ticket thread with that user, enabling seamless 2-way communication.

---

## ✨ Key Features

### 🎫 Ticket Support System
*   **Status Filter System**: Instantly filter tickets by Open, In Progress, Resolved, or Closed.
*   **Role-Based Dashboards**: Real-time filtering shows users only the tickets relevant to them.
*   **Conversation Threads**: Seamless messaging between users with distinct stylistic separation for responders.
*   **Admin Messaging**: Admins can initiate conversations with *any* student or teacher on the platform.
*   **Ownership Control**: Creators can delete their own tickets to maintain a clean history.

### ⭐ Review System
*   **Teacher Selection**: Dynamically fetch and select specific teachers when creating a new review.
*   **Aggregated Ratings**: Automatic calculation of a teacher's average rating and total review count.
*   **Validated Feedback**: Enforced character limits and star selections to ensure high-quality, constructive feedback.
*   **Real-time Profile Updates**: Teacher summary cards update immediately upon a new review submission.

### 🔍 Search & Discovery
*   **Dynamic Dropdowns**: The system fetches users (Teachers or Students) on-the-fly when creating tickets or reviews, eliminating the need for hardcoded IDs and preventing validation errors.

---

## 🛡️ Validation System Architecture

### 1. Frontend Form Validations
We implement immediate client-side feedback to enhance UX and prevent unnecessary server load.

| Feature | Field | Validation Rule | Error Message |
| :--- | :--- | :--- | :--- |
| **Reviews** | User Selection | Must select a specific teacher | "Please select a teacher" |
| | Star Rating | Must be selected (1-5) | "Please select a star rating" |
| | Comment | Min 10, Max 500 chars | "Comment must be at least 10 characters" |
| **Tickets** | User Selection | Must select recipient (unless Admin) | "Please select a specific user" |
| | Subject | Min 5 characters | "Subject must be at least 5 characters" |
| | Description | Min 20 characters | "Description must be at least 20 chars" |

### 2. Backend Logic & Security
*   **Role Protection**: Middleware ensures only students can post reviews and only recipients/admins can update ticket statuses.
*   **Identity Verification**: The system verifies that the `studentId` of a ticket matches the requesting user's ID before allowing a `DELETE` operation.
*   **Dynamic Querying**: New `/api/users` endpoint securely queries users based on their role (`student`, `teacher`, `admin`) to populate frontend selection menus.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure .env is configured with MONGO_URI and JWT_SECRET
node seed.js # IMPORTANT: Seeds the simulation users
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Technology Stack
*   **Frontend**: React, TailwindCSS, Axios, React Router.
*   **Backend**: Node.js, Express.js, MongoDB, Mongoose.
*   **Security**: JWT-based authentication (Mocked for simulation), Role-Based Access Control (RBAC).
