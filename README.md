# SkillSphere LMS

SkillSphere is a full-stack Learning Management System (LMS) built using the MERN stack.

It supports students, instructors, and admins with modern learning platform features including authentication, course management, quizzes, certificates, notifications, and progress tracking.

---

# Features

## Authentication

* Register/Login system
* JWT Authentication
* Role-based access
* Protected routes
* Forgot Password
* Reset Password via Email

## Student Features

* Browse courses
* Enroll in courses
* Track progress
* Continue learning
* Quiz attempts
* Certificates
* Notifications
* Search courses

## Instructor Features

* Create courses
* Edit/Delete courses
* Publish/Unpublish courses
* Add sections and lessons
* Instructor dashboard
* Analytics

## Course System

* Course categories
* Course search
* Filters
* Draft & Published courses
* Progress tracking

## Quiz System

* Quiz attempts
* Pass/Fail status
* Quiz analytics

## Certificate System

* Generate certificates
* Verify certificates
* Unique certificate IDs

## Notifications

* Real-time notification UI
* Mark as read
* Mark all as read

---

# Tech Stack

## Frontend

* React
* React Router
* Tailwind CSS
* Axios
* Lucide React

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Nodemailer

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/skillsphere-lms.git
```

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

# Environment Variables

Create `.env` file inside server folder.

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=SkillSphere <your_email>
```

---

# Run Project

## Backend

```bash
npm run dev
```

## Frontend

```bash
npm run dev
```

---

# Future Improvements

* Cloudinary image uploads
* Video uploads
* Stripe/Razorpay payments
* Admin analytics
* Live classes
* Discussion forum
* Dark mode

---

# Author

Sumit Saini
