# Employee Task Tracker – Mini Dashboard

## Project Overview

Employee Task Tracker is a simple mini SaaS dashboard application developed using React, TypeScript, Node.js, Express, and SQLite.

The application allows users to manage daily tasks with features like task creation, editing, deletion, completion tracking, and filtering based on task status.

The project was developed as part of a frontend/backend assessment task.

---

# Features

- User Login (Dummy Authentication)
- Add New Tasks
- Edit Existing Tasks
- Delete Tasks
- Mark Tasks as Completed
- Filter Tasks by Status
- Persistent Data Storage using SQLite
- Responsive UI for Mobile and Desktop

---

# Tech Stack Used

## Frontend
- React.js
- TypeScript
- Tailwind CSS
- Axios
- React Router DOM
- Vite

## Backend
- Node.js
- Express.js

## Database
- SQLite
- Sequelize ORM

---

# Project Structure

```bash
employee-task-tracker/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── database.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# Setup Instructions

## Clone Repository

```bash
git clone https://github.com/ManiNataraj/Employee-Task-Tracker.git
```

---

# Frontend Setup

## Navigate to client folder

```bash
cd client
```

## Install dependencies

```bash
npm install
```

## Start frontend server

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Backend Setup

## Navigate to server folder

```bash
cd server
```

## Install dependencies

```bash
npm install
```

## Start backend server

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

# API Endpoints

## Get All Tasks

```http
GET /tasks
```

## Create Task

```http
POST /tasks
```

## Update Task

```http
PUT /tasks/:id
```

## Delete Task

```http
DELETE /tasks/:id
```

---

# Architecture Overview

The application follows a simple client-server architecture.

## Frontend
The frontend is built using React with TypeScript and Tailwind CSS. React components handle task management UI and communicate with the backend using Axios.

## Backend
The backend is developed using Express.js. REST APIs are created for handling CRUD operations related to tasks.

## Database
SQLite is used as the database because it is lightweight and easy to configure for small-scale applications. Sequelize ORM is used for database operations.

---

# Challenges Faced

During development, I faced a few practical issues while implementing the project.

- Initially faced TypeScript type errors while handling task objects and API responses.
- Faced UI alignment issues while making the dashboard responsive for smaller screen sizes.
- Encountered problems while implementing task filtering and updating state correctly after CRUD operations.
- Button positioning and conditional rendering caused minor UI bugs during edit and complete task features.
- While integrating frontend and backend, CORS-related issues occurred initially and were resolved using Express CORS middleware.

These challenges helped improve debugging and state management understanding during development.

---

# Future Improvements

- JWT Authentication
- Search Functionality
- Dark Mode
- Due Date Notifications
- Pagination
- User-specific Task Management

---

# Deployment

Deployed using Vercel


---

# Author

Manikandan N