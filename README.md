# Learning Management System (LMS)
# Overview

This project is a full-stack Learning Management System (LMS) designed to demonstrate end-to-end software engineering capabilities, including frontend development, backend APIs, database design, authentication, and containerized deployment.

The system supports role-based access for Admins and Learners, enabling course creation, lesson management, progress tracking, and audit logging.

# Tech Stack
- Frontend
Next.js (React)
Axios
Tailwind CSS
shadcn/ui
- Backend
Node.js
Express.js
JWT Authentication
bcrypt (password hashing)
Databases
PostgreSQL → Users, Roles, Course metadata
MongoDB → Lessons, User progress, Audit logs
- DevOps
Docker
Docker Compose
# Features
# Admin
Log in with admin credentials
Create courses (title, description, category)
Add lessons (text/video)
View all created courses
View audit logs (user activity)
# Learner
Register and log in
Browse course catalog
View course details and lessons
Mark lessons as completed
Track course progress (e.g., 3/5 lessons)
# System Features
JWT-based authentication
Role-based access control (Admin / Learner)
Audit logging (tracks user actions)
Input validation (frontend & backend)
Error handling for API responses

# sytem Architecture

The application follows a modular monolithic architecture:
Auth Module
Course Module
Lesson Module
Progress Module
Audit Module

Each module is isolated and structured in a way that allows future decomposition into microservices.

# Database Design
- PostgreSQL (Relational)
Used for structured and relational data:

Users (authentication & roles)
Courses (metadata)

Reason:

Strong consistency
Efficient handling of relationships

- MongoDB (NoSQL)
Used for flexible and nested data:

Lessons (varying content types)
User progress tracking
Audit logs

Reason:

Flexible schema
Efficient for dynamic and nested data

# API Endpoints
- Auth
POST /auth/register → Register a new user
POST /auth/login → Authenticate user and return JWT
- Courses
GET /courses → Get all courses
POST /courses (Admin) → Create a new course
GET /courses/:id → Get course details
- Lessons
POST /lessons (Admin) → Add lesson to course
GET /lessons/:courseId → Get lessons for a course
- Progress
POST /progress → Mark lesson as completed
GET /progress/:userId/:courseId → Get user progress
- Audit Logs
GET /audit (Admin) → View system activity logs

# Getting Started
# Prerequisites
Docker Desktop installed
WSL2 (for Windows users)
Run the Application
docker compose up --build
# Access the Application
Frontend: http://localhost:3000
Backend API: http://localhost:5000

# Test Accounts
Admin
Email: zipporah@gmail.com
Password: 123456
Learner
Email: kwamboka@gmail.com
Password: 12345
# How to Test the System
Log in as Admin
Create a new course
Add lessons to the course
Log out
Log in as Learner
Browse available courses
Open a course and view lessons
Mark lessons as completed
Check progress tracking

# Environment Variables
- Backend (.env)
PORT=5000
JWT_SECRET=your_secret

PG_USER=postgres
PG_PASSWORD=password
PG_HOST=postgres
PG_DB=lms

MONGO_URI=mongodb://mongo:27017/lms

- Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://learning-management-system-backend-ncxt.onrender.com

# Docker Setup

Docker Compose orchestrates the entire system:

Frontend (Next.js)
Backend (Express API)
PostgreSQL
MongoDB

- Benefits
One-command setup
Consistent environment across machines
Easy evaluation and testing

# Audit Logging

The system logs key user actions such as:

Course creation
Lesson creation
Lesson completion
User authentication events

This supports traceability and basic security auditing.

# Microservices Decomposition

Although implemented as a monolith, the system can be split into microservices:

Auth Service → Authentication & JWT
Course Service → Course management
Lesson Service → Lesson handling
Progress Service → User progress tracking
Audit Service → Logging and monitoring

Each module communicates via APIs and can be independently deployed.

# Design

Wireframes and design sketches are included in the /design folder.

These guided the implementation and ensured a clear and consistent user experience.

# Design Decisions & Trade-offs
Decisions
PostgreSQL for structured relational data
MongoDB for flexible content and logs
JWT for stateless authentication
Docker for reproducible environments
Trade-offs
Monolithic architecture chosen for simplicity over microservices complexity
Basic UI prioritised over advanced design due to time constraints

# Repository Structure
/frontend
/backend
/design
/docker-compose.yml
README.md


✅ Summary

This project demonstrates:

Full-stack development
RESTful API design
Hybrid database architecture (SQL + NoSQL)
Authentication & authorization
Docker-based deployment
Scalable system design principles