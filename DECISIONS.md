# Technical Decisions

This document records the decisions used in the completed TaskFlow task management application.


# Important Technical Decisions
React + TypeScript

The frontend uses React, TypeScript, Vite, React Router, and Tailwind CSS to build a simple task management interface.

Express + TypeScript

The backend uses Node.js, Express, and TypeScript with separate routes, controllers, middleware, and models.

MongoDB + Mongoose

MongoDB Atlas is used for persistent data storage. Mongoose handles schemas, validation, and relationships between users and tasks.

JWT Authentication

Users can register and log in using JWT authentication. Passwords are securely hashed using bcrypt. Protected APIs require a valid JWT token.

Task Assignment

Each task can have one creator and an optional assignee. The application supports at least two users so task assignment can be demonstrated.

Admin Invitations

Only configured admin users can invite new team members. Invitations are sent using Nodemailer with a signup link and an expiry period.

API Configuration

The React frontend uses Axios to communicate with the Express API. The API URL is configured using VITE_API_URL.

# Assumptions
A task has a title, description, status, priority, creator, and optional assignee.

Task status: Todo, In Progress, Done.

Task priority: Low, Medium, High.

Users can create, edit, view, and delete tasks.

Tasks can be assigned to another team member.

Only admins can invite new users.

Real-time updates are not required.

MongoDB Atlas is used as the primary database.
Alternatives Considered

SQL Database :-
SQL could be used, but MongoDB was selected because it is the intended database and fits the task-based document structure.

Firebase / Supabase

These could provide authentication and database services, but MongoDB + Express was chosen to keep the backend under our control.

Server-Side Rendering

Next.js could be used, but React + Vite is sufficient for this authenticated application.

Real-Time Updates

WebSockets could provide real-time updates, but they are unnecessary for the current MVP.

# Key Tradeoffs
The layered Express structure makes the backend easier to maintain but adds some files.
MongoDB provides a simple and flexible data model but is less suitable for complex relational reporting.
JWT keeps the API simple and stateless but requires proper security practices in production.
Nodemailer allows email invitations, but SMTP configuration is required for actual email delivery.
The application focuses on the core MVP rather than advanced permissions, real-time collaboration, or complex UI features.