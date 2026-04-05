# TaskMate

A full-stack task management application built with Node.js, TypeScript, and Next.js. Users can register, log in, and manage their personal tasks with full CRUD operations.

---

## Project Structure

```
TaskMate/
├── Client/          # Next.js frontend (TypeScript)
└── Server/          # Node.js + Express backend (TypeScript)
```

---

## Tech Stack

### Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (Access Token + Refresh Token)
- **Password Hashing**: bcrypt
- **Validation**: Zod

### Client
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: lucide-react

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL running locally (or a connection string)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/TaskMate.git
cd TaskMate
```

---

### 2. Setup the Server

```bash
cd Server
npm install
```

Create a `.env` file in the `Server/` directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskmate"
JWT_ACCESS_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
BCRYPT_ROUNDS=12
PORT=8000
NODE_ENV="development"
```

Run database migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

Server runs at `http://localhost:8000`

---

### 3. Setup the Client

```bash
cd ../Client
npm install
```

Create a `.env.local` file in the `Client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Client runs at `http://localhost:3000`

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and receive tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Revoke refresh token | No |

### Tasks

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (paginated) | Yes |
| POST | `/tasks` | Create a new task | Yes |
| GET | `/tasks/:id` | Get a single task | Yes |
| PATCH | `/tasks/:id` | Update a task | Yes |
| DELETE | `/tasks/:id` | Delete a task | Yes |
| PATCH | `/tasks/:id/toggle` | Toggle task status | Yes |

### Query Parameters for `GET /tasks`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `status` | string | Filter by `PENDING` or `COMPLETED` |
| `search` | string | Search by task title |

### Example Response — `GET /tasks`

```json
{
  "page": 1,
  "limit": 10,
  "total": 4,
  "data": [
    {
      "id": "a61efe1c-5d6b-48be-bed4-bbc3ceeeb3a7",
      "title": "Upload to github",
      "description": "Push all changes to the remote repository",
      "status": "PENDING",
      "userId": "453e8c55-f9e9-46a2-bd33-8e7a31c0ac3e",
      "createdAt": "2026-04-05T09:08:03.955Z",
      "updatedAt": "2026-04-05T09:08:03.955Z"
    }
  ]
}
```

---

## Database Schema

```prisma
model User {
  id           String         @id @default(uuid())
  email        String         @unique
  passwordHash String
  name         String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  tasks        Task[]
  refreshTokens RefreshToken[]
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  user        User       @relation(fields: [userId], references: [id])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum TaskStatus {
  PENDING
  COMPLETED
}
```

---

## Environment Variables

### Server — `Server/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry (e.g. `7d`) |
| `BCRYPT_ROUNDS` | bcrypt salt rounds (recommended: 12) |
| `PORT` | Server port (default: 8000) |
| `NODE_ENV` | `development` or `production` |

### Client — `Client/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## Available Scripts

### Server

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Compile TypeScript
npm run start      # Run compiled production build
npm run db:migrate # Run Prisma migrations
npm run db:studio  # Open Prisma Studio
npm run db:reset   # Reset database and re-run migrations
```

### Client

```bash
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## Features

- User registration and login with JWT authentication
- Access token + refresh token strategy with automatic rotation
- Password hashing with bcrypt
- Create, read, update, and delete tasks
- Toggle task status between `PENDING` and `COMPLETED`
- Search tasks by title
- Filter tasks by status
- Paginated task list
- Responsive UI for desktop and mobile
- Toast notifications for all operations

---

## Security

- Passwords are hashed with bcrypt before storage
- Access tokens expire in 15 minutes
- Refresh tokens are rotated on every use and revoked on logout
- All task endpoints verify the token and check task ownership
- Environment secrets are never committed to version control

---

## .gitignore

Make sure these are in your `.gitignore`:

```
node_modules/
dist/
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
```