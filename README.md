# TaskFlow - Team Task Manager

Full-stack task management app for teams. Create projects, assign tasks, track progress — with role-based access control.

**Live:** [https://team-task-manager-production-621c.up.railway.app](https://team-task-manager-production-621c.up.railway.app)

## Features

- **Authentication** — Signup/login with email and password (bcrypt hashed, JWT sessions)
- **Projects** — Create and manage projects, add/remove team members
- **Task Board** — Kanban-style columns (To Do / In Progress / Done) with status toggle
- **Dashboard** — Stats overview, overdue detection, activity feed, search & filter
- **Role-Based Access** — Admin (full control) and Member (scoped actions) roles
- **Activity Log** — Track who did what across all projects
- **Priority Levels** — Low / Medium / High with color coding
- **Due Dates** — Overdue highlighting on dashboard and task cards

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials + JWT) |
| Styling | Tailwind CSS |
| Deployment | Railway |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

```bash
git clone https://github.com/anmolmalviya0/team-task-manager.git
cd team-task-manager
npm install
cp .env.example .env
# edit .env with your database URL and secrets
npx prisma migrate dev --name init
npm run dev
```

### Seed Demo Data (optional)

```bash
npx prisma db seed
```

Creates sample users, projects, and tasks for testing.

**Demo accounts after seeding:**
- Admin: `anmol@taskflow.dev` / `admin123`
- Member: `priya@taskflow.dev` / `member123`

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/[...nextauth]` | Login/logout/session |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Any | List user's projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Members | Project details |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |

### Team
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects/:id/tasks` | Members | List tasks |
| POST | `/api/projects/:id/tasks` | Members | Create task |
| PUT | `/api/tasks/:id` | Owner/Assignee/Admin | Update task |
| DELETE | `/api/tasks/:id` | Creator/Admin | Delete task |

### Activity
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/activity` | Recent activity log |

## Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create/edit/delete projects | Yes | No |
| Manage team members | Yes | No |
| Create tasks | Yes | Yes |
| Update own tasks | Yes | Yes |
| Update any task | Yes | No |
| Delete any task | Yes | No |
| View activity log | Yes | Yes |

## Project Structure

```
app/
├── api/
│   ├── auth/           # Signup + NextAuth routes
│   ├── projects/       # Project CRUD + members + tasks + activity
│   └── tasks/          # Task update/delete
├── dashboard/          # Stats, search, activity feed
├── login/              # Login form
├── signup/             # Signup form
└── projects/           # Project list, detail, task creation
components/
├── Navbar.tsx          # Navigation with role badge
└── SessionProvider.tsx # NextAuth client wrapper
lib/
├── auth.ts             # NextAuth config
├── prisma.ts           # Prisma singleton
└── activity.ts         # Activity logging helper
prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Demo data seeder
```

## Deployment

Deployed on Railway with PostgreSQL plugin.

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npx prisma migrate deploy && npm start"
```

### Environment Variables

```
DATABASE_URL       — PostgreSQL connection string
NEXTAUTH_SECRET    — Random string for JWT signing
NEXTAUTH_URL       — App URL (e.g. https://your-app.up.railway.app)
```

## Design Decisions

- **String enums over Prisma enums** — Easier to extend without migrations
- **JWT over database sessions** — No extra DB calls on every request
- **Activity log** — Audit trail for team accountability
- **Skeleton loading** — Better perceived performance over blank screens
- **Task board pattern** — Intuitive kanban-style workflow familiar to teams

---

Built by [Anmol Malviya](https://github.com/anmolmalviya0)
