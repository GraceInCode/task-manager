# Collaborative Task Manager

A real-time collaborative task management application with drag-and-drop Kanban boards, built with React, Node.js, Express, Prisma, and Socket.IO.

## Features

- **User Authentication** - Register/login with JWT
- **Board Management** - Create and manage multiple boards
- **Real-time Collaboration** - Live updates via WebSockets
- **Kanban Cards** - Drag-and-drop task cards across lists
- **Task Assignment** - Assign cards to users
- **Comments & Attachments** - Add comments and file attachments to cards
- **Email Notifications** - Nodemailer integration
- **Board Sharing** - Invite collaborators to boards

## Tech Stack

**Frontend:**

- React 19
- React Router
- React DnD (drag-and-drop)
- Axios
- Socket.IO Client
- Tailwind CSS
- React Toastify

**Backend:**

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT Authentication
- Bcrypt
- Cloudinary (file uploads)
- Nodemailer

**Testing:**

- Jest (unit tests)
- Cypress (E2E tests)

## Setup

### Prerequisites

- Node.js
- PostgreSQL database

### Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# Run Prisma migrations
npx prisma migrate dev

# Start server
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

The frontend runs on `http://localhost:3000` and connects to the backend at `http://localhost:5000`.

## Environment Variables

**Backend (.env):**

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run cypress
```

## Deployment

Backend is deployed on Render: `https://task-manager-yjcd.onrender.com`

## License

ISC
