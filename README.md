# Travel Story Website

A full-stack travel story sharing platform where users can create, share, and discover travel experiences. Built as a college project using the MERN stack.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication
- **Media Storage**: Cloudinary
- **Styling**: Tailwind CSS

## Features

### Core
- User Registration & Login (JWT-based)
- User Profile with avatar
- Create / Edit / Delete Travel Stories
- Image Gallery with Cloudinary uploads

### Social
- Like / Unlike stories
- Comment on stories
- Bookmark stories for later

### Discovery
- Search stories by title, destination, or content
- Filter by destination
- Filter by category
- Popular Stories section
- Recent Stories section
- Story View Counter

### Travel-Specific
- **Reachable By** — multi-select: Train, Bus, Vehicle, Flight
- **Family Friendly** — yes/no indicator with optional suitability note

### Other
- Contact / Feedback Form
- Responsive design (mobile, tablet, desktop)

## Project Structure

```
Travel Story Website/
├── frontend/          # React + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB
├── .env.example       # Environment variables template
├── .gitignore
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account (free tier)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Travel Story Website"
```

### 2. Environment Variables

Copy `.env.example` to `backend/.env` and fill in your values:

```bash
cp .env.example backend/.env
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the App

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Backend server port (default: 5000) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Documentation

Detailed documentation is available in the `docs/` folder:

- [PRD.md](../docs/PRD.md) — Product Requirements Document
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) — System Architecture
- [DESIGN.md](../docs/DESIGN.md) — Design Specifications
- [RULES.md](../docs/RULES.md) — Development Rules
- [TASKS.md](../docs/TASKS.md) — Task Checklist
- [TEST_PLAN.md](../docs/TEST_PLAN.md) — Test Plan

## Development Status

**Current Phase: Phase 2 (Frontend Authentication)**

### Phase Status
1. ✅ **Documentation** (PRD, Architecture, Design, Rules, Tasks, Test Plan)
2. ✅ **Project Setup & Environment** (Full-stack MERN project structure, backend connected to MongoDB Atlas)
3. ✅ **Backend Authentication System** (JWT-based auth with registration/login endpoints, verified working)
4. 🔄 **Frontend Authentication** (Currently implementing registration/login UI to connect with backend API)
5. ⬜ **User Profile**
6. ⬜ **Story CRUD**
7. ⬜ **Reachable By & Family Friendly**
8. ⬜ **Social Interactions** (Likes, Comments, Bookmarks)
9. ⬜ **Search & Filters**
10. ⬜ **Home Page Features**
11. ⬜ **Contact & Feedback**
12. ⬜ **Polish & Refinement**
13. ⬜ **Testing**
14. ⬜ **Deployment**

### Recent Progress (2026-10-01)
- ✅ Backend server deployed with MongoDB Atlas connection
- ✅ User registration and login APIs working with JWT authentication
- ✅ Test user registration confirmed in MongoDB database
- 🔄 Frontend authentication forms under development (Phase 2 in progress)

## License

This project is for educational purposes (college project).
