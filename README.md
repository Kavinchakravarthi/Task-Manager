# TaskFlow Task Manager

TaskFlow is a full-stack task management application. Users can create and manage tasks, filter and sort task lists, assign work to team members, add comments, and manage team invitations.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express 5, TypeScript
- Database: MongoDB through Mongoose
- Authentication: JWT tokens and bcrypt password hashing
- Email: Nodemailer for team invitations

## Project Structure

```text
frontend/                 React client
	src/components/         Shared layout, route, task, and loading components
	src/context/            Authentication state
	src/pages/               Login, dashboard, task, team, and settings pages
	src/services/            Axios API client
backend/                  Express API
	src/controllers/         Request handlers
	src/middleware/          Authentication middleware
	src/models/              Mongoose models
	src/routes/              API route definitions
	src/utils/               Validation, response, and mail helpers
	tests/                   Backend Jest tests
```

## Setup

### Prerequisites

- Node.js 20
- npm
- A MongoDB connection string for persistent data

### Install dependencies

Run these commands from the repository root:

```powershell
npm install
Set-Location frontend
npm install
Set-Location ..\backend
npm install
Set-Location ..
```

The root package has no application start script. Install and run the `frontend` and `backend` packages separately as described below.

### Configure the backend

Create `backend/.env` manually. The backend reads these variables:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAILS=admin@example.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
NODE_ENV=development
```

`MONGODB_URI` may be a local MongoDB URL or a MongoDB Atlas connection string. If it is empty, the backend starts a MongoDB Memory Server instance for local or test use. Data in that instance is temporary.

`ADMIN_EMAILS` is a comma-separated list of email addresses allowed to invite team members. SMTP variables are optional during development. Without them, invitation emails use Nodemailer's JSON transport and are not delivered externally.

The frontend defaults to `http://localhost:5000/api`. To use another API URL, create `frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

## Run the Project

Start the backend in one terminal:

```powershell
Set-Location backend
npm run dev
```

Start the frontend in a second terminal:

```powershell
Set-Location frontend
npm run dev
```

Open the Vite URL shown in the frontend terminal, normally:

```text
http://localhost:5173
```

### Production builds

Build the backend:

```powershell
Set-Location backend
npm run build
```

Start the compiled backend:

```powershell
npm start
```

Build the frontend:

```powershell
Set-Location ..\frontend
npm run build
```

Preview the frontend build with:

```powershell
npm run preview
```

### Tests

Run the backend Jest test suite:

```powershell
Set-Location backend
npm test
```

## Architecture Overview

The frontend is a Vite React single-page application. `AuthContext` stores the authenticated user and token, `ProtectedRoute` guards private pages, and `AppLayout` provides the shared navigation and account controls. Pages call the backend through the Axios client in `frontend/src/services/api.ts`.

The backend exposes Express routes under `/api`. Routes apply validation and authentication middleware before delegating to controllers. Controllers use Mongoose models for users, tasks, invitations, and comments. JWT middleware protects authenticated requests, while admin middleware protects team invitations.

## API Overview

The backend runs on port `5000` by default. Authenticated endpoints expect:

```http
Authorization: Bearer <jwt-token>
```

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Check API availability |

### Authentication and team

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Authenticate a user and return a token |
| GET | `/api/auth/me` | Yes | Return the current user |
| GET | `/api/auth/users` | Yes | List team members |
| POST | `/api/auth/invite` | Admin | Invite a team member |

### Tasks and comments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | Yes | List tasks with filtering, sorting, pagination, and optional assignee filtering |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks/:id` | Yes | Get one task and its comments |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
| POST | `/api/tasks/:id/comments` | Yes | Add a comment to a task |

## Known Limitations

- The root `package.json` does not provide combined install, development, build, or test scripts; frontend and backend commands must be run separately.
- Without `MONGODB_URI`, data is stored in a temporary MongoDB Memory Server instance and is lost when the backend stops.
- Invitation emails are not delivered unless SMTP settings are configured.
- Authentication uses a browser local-storage token; there is no refresh-token flow.
- There are no real-time updates or WebSocket notifications. Users must refresh or revisit a view to see changes made elsewhere.
- The backend has tests, but the frontend does not currently have an automated component or end-to-end test suite.
- Deployment configuration, production secret management, and database migrations are not included.
