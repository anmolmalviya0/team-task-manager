# TaskFlow - Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

## Features

- User authentication (signup/login)
- Role-based access: Admin and Member roles
- Project creation and team management
- Task creation, assignment, and status tracking (To Do / In Progress / Done)
- Dashboard with task overview, status breakdown, and overdue task detection
- Priority levels (Low / Medium / High)
- Due date tracking with overdue highlighting

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (Credentials provider)
- **Styling:** Tailwind CSS
- **Deployment:** Railway

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/anmolmalviya0/team-task-manager.git
cd team-task-manager
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev --name init
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - Login/logout (NextAuth)

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project (Admin only)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Team Members
- `POST /api/projects/:id/members` - Add member (Admin only)
- `DELETE /api/projects/:id/members` - Remove member (Admin only)

### Tasks
- `GET /api/projects/:id/tasks` - List tasks in project
- `POST /api/projects/:id/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin or creator)

## Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create project | Yes | No |
| Delete project | Yes | No |
| Add team members | Yes | No |
| Create tasks | Yes | Yes |
| Update own tasks | Yes | Yes |
| Update any task | Yes | No |
| Delete any task | Yes | No |

## Deployment

Deployed on Railway with PostgreSQL.

```bash
# Railway handles build and deploy automatically via GitHub integration
# Start command: npx prisma migrate deploy && npm start
```

## Project Structure

```
app/
├── api/            # REST API routes
├── dashboard/      # Dashboard page
├── login/          # Login page
├── signup/         # Signup page
├── projects/       # Project pages (list, detail, create)
components/         # Shared UI components
lib/                # Prisma client, auth config
prisma/             # Database schema
types/              # TypeScript type declarations
```
