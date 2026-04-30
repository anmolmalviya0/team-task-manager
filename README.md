# TaskFlow - Team Task Manager

A team task management app with role-based access, built for the Ethara AI assignment.

**Live app:** https://team-task-manager-production-621c.up.railway.app

## Features

- Signup/Login with JWT sessions
- Admin and Member roles (Admin can manage projects + members, Member can manage tasks)
- Create projects, add team members by email
- Task board with kanban columns (To Do / In Progress / Done)
- Dashboard with stats, overdue tasks, search, and activity feed
- Priority levels and due date tracking

## Tech Stack

- Next.js 14 (App Router), TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js with Credentials provider
- Tailwind CSS
- Deployed on Railway

## Setup

```bash
git clone https://github.com/anmolmalviya0/team-task-manager.git
cd team-task-manager
npm install
cp .env.example .env
# fill in your database url and nextauth secret
npx prisma migrate dev --name init
npm run dev
```

## Seed Data

```bash
npx prisma db seed
```

This creates demo accounts you can use:
- Admin: `anmol@taskflow.dev` / `admin123`
- Member: `priya@taskflow.dev` / `member123`

## API Endpoints

**Auth:**
- `POST /api/auth/signup` - register
- NextAuth handles login/logout/session

**Projects:**
- `GET /api/projects` - list projects (user must be owner or member)
- `POST /api/projects` - create (admin only)
- `GET/PUT/DELETE /api/projects/:id` - project CRUD

**Members:**
- `POST /api/projects/:id/members` - add member by email (admin only)
- `DELETE /api/projects/:id/members` - remove member

**Tasks:**
- `GET/POST /api/projects/:id/tasks` - list/create tasks
- `PUT/DELETE /api/tasks/:id` - update/delete (role checks apply)

**Activity:**
- `GET /api/projects/:id/activity` - recent activity log

## Role Access

- Admin: full access to everything (create projects, manage members, all tasks)
- Member: can view projects they belong to, create tasks, update own tasks

## Deployment

Railway with PostgreSQL plugin. Start command runs migrations automatically:

```
npx prisma migrate deploy && npm start
```

Environment vars needed: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Project Structure

```
app/
  api/          - REST endpoints
  dashboard/    - main dashboard page
  login/        - login form
  signup/       - signup form
  projects/     - project list, detail, task creation
components/     - Navbar, SessionProvider
lib/            - auth config, prisma client, activity logger
prisma/         - schema + seed script
```

---

Built by Anmol Malviya
