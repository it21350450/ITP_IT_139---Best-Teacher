# 💰 Financial Management System (Best Teacher)

A robust, role-based financial management portal built with the **MERN** stack. This project facilitates lesson bookings, student payments, teacher earnings tracking, and platform administration.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** (Local or Atlas instance)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` folder (reference `.env.example` if available):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app at: `http://localhost:5173` (or the port shown in your terminal).

---

## 🏗️ Project Architecture

### **Frontend** (`/frontend`)
- **Vite + React**: Fast development and modern UI patterns.
- **Tailwind CSS**: Utility-first styling for a premium, responsive design.
- **Lucide Icons**: Modern SVG icon library for consistent visual language.
- **Axios**: Centralized API service layer with JWT interceptors.

### **Backend** (`/backend`)
- **Express & Node.js**: Scalable REST API architecture.
- **MongoDB + Mongoose**: Schema-based data modeling for financial objects.
- **JWT Authentication**: Role-based access control (RBAC) implementation.
- **Controllers/Routes Pattern**: Clean separation of concerns.

---

## 🛡️ Frontend Validations & Features
 
Robust validation and dynamic filters are implemented across all critical financial entry points to ensure data integrity and a smooth user experience.
 
### **Student Portal**
- **Lesson Creation**: 
  - Subject and Teacher names cannot be empty.
  - **Dropdown Selection**: Teacher names and Grades are handled using structured selection menus.
  - Amount must be a positive number (> 0).
- **Edit Records**: Interactive updates with instant validation feedback.
 
### **Teacher Portal**
- **Payout Requests**: 
  - Validates payout amount against the **Available Balance**.
  - Prevents requesting non-positive or irrational amounts.
- **Real-time Feedback**: UI indicators for "Amount Exceeds Balance" and "Invalid Format".
 
### **Admin Portal**
- **Platform Configuration**:
  - **Global Fee**: Strictly constrained between **0% and 100%**.
  - Prevents system-wide configuration errors via pre-submission checks.

---

## 🔄 Booking & Payment Workflow

The application handles full financial execution logic:

1. **Booking Trigger**:
   - Once a student creates a confirmed booking, a Mongoose `post('save')` lifecycle trigger fires.
   - This background job allocates a `pending` **Transaction** log and sets up a localized **Payment** record capturing variables like *Grade, Amount, and Subject*.
2. **Transaction Gateway Completion**:
   - Proceeding to click "Pay Now" reconciles these logs. 
   - Balance statuses move reliably from `pending` to `completed`.
3. **Revenue Distribution & Invoicing**:
   - Teacher profiles are disbursed capital immediately, alongside standalone generation of secure digital **Invoices**.

---
 
## 🗄️ Database & Models
 
The project uses **MongoDB** as its primary data store. The following key models are located in `backend/models/`:
 
- **Booking**: Stores lesson booking requests, statuses, and pricing.
- **Payout**: Tracks teacher withdrawal requests and their processing states.
- **Transaction**: Ledger for all financial movements (Student -> Platform -> Teacher).
- **Invoice**: Automated billing records for auditing.
- **GlobalConfig**: System-wide settings like platform fee percentages.
 
---
 
## 💎 Features & Role Views
 
- ⭐ **Student View**: Dashboard for pending payments, payment history, and lesson requests.
- 🎓 **Teacher View**: Earnings dashboard showing total revenue, available balance, and withdrawal status.
- 🛡️ **Admin View**: Master ledger access, payout processing (Approve/Reject), and global platform fee configuration.
- 🌓 **Aesthetics**: Premium Glassmorphic UI with support for modern design patterns and accessible typography.
