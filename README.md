# Project Title + Overview

A full-stack Learning Management System (LMS) built using Next.js, Node.js, PostgreSQL, and MongoDB. The system supports role-based access for Admins and Learners, course management, lesson tracking, and audit logging.

The project demonstrates full-stack engineering, database design, authentication, and containerized deployment using Docker.

# Tech Stack

### Frontend
- Next.js (React)
- Axios
- Tailwind CSS
- shadcn

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt

### Databases
- PostgreSQL (Users, Courses)
- MongoDB (Lessons, Progress, Audit Logs)

### DevOps
- Docker
- Docker Compose

## Features

### Admin
- Create courses
- Add lessons (text/video)
- View all courses
- View audit logs

### Learner
- Register & login
- Browse courses
- View course details
- Mark lessons as completed
- Track progress

### System
- JWT authentication
- Role-based access control
- Audit logging
- Input validation

## System Architecture

The system follows a modular monolithic architecture with clear separation of concerns:

- Auth module
- Course module
- Lesson module
- Progress module
- Audit module

Each module is structured in a way that allows future extraction into microservices.

## Database Design

### PostgreSQL (Relational)
Used for structured data:
- Users (authentication, roles)
- Courses (metadata)

Reason:
- Strong consistency
- Relationships between users and courses

### MongoDB (NoSQL)
Used for flexible data:
- Lessons (varying content types)
- User progress
- Audit logs

Reason:
- Flexible schema
- Efficient for nested/variable data

## API Endpoints

### Auth
POST /auth/register  
POST /auth/login  

### Courses
GET /courses  
POST /courses (Admin)  
GET /courses/:id  

### Lessons
POST /lessons (Admin)  
GET /lessons/:courseId  

### Progress
POST /progress  
GET /progress/:userId/:courseId  

### Audit Logs
GET /audit (Admin)

## Setup Instructions

### Prerequisites
- Docker Desktop installed
- WSL2 enabled (for Windows)

### Run the application

```bash
docker compose up --build


---

## 🟦 8. Environment Variables

```md id="p9bz9j"
## Environment Variables

### Backend (.env)

PORT=5000  
JWT_SECRET=your_secret  

PG_USER=postgres  
PG_PASSWORD=password  
PG_HOST=postgres  
PG_DB=lms  

MONGO_URI=mongodb://mongo:27017/lms  

### Frontend (.env.local)

NEXT_PUBLIC_API_URL=http://backend:5000

## Docker Setup

The application uses Docker Compose to orchestrate:

- frontend (Next.js)
- backend (Express API)
- PostgreSQL database
- MongoDB database

Benefits:
- One-command setup
- Consistent environment
- Simplified deployment

## Microservices Decomposition

The system is designed as a modular monolith but can be split into microservices:

- Auth Service → handles login and JWT
- Course Service → manages courses
- Lesson Service → handles lesson content
- Progress Service → tracks user progress
- Audit Service → logs system activity

Each module is isolated and communicates via APIs, making it easy to extract into independent services.

## Design Decisions

- Used PostgreSQL for structured relational data
- Used MongoDB for flexible content and logs
- Chose JWT for stateless authentication
- Used Docker for reproducible environments

### Trade-offs
- Monolithic backend for simplicity vs microservices complexity
- Basic UI vs advanced design due to time constraints

## UI Design

Wireframes are included in the /design folder.

These guided the implementation and ensured consistent layout and user flow.