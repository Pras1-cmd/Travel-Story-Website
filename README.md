# 🌍 Travel Story Website

A full-stack travel storytelling platform built using the MERN stack. Users can share their travel experiences, upload photos, discover destinations, and interact with stories shared by other travelers.

## ✨ Features

- **User Authentication** — Register, login, logout, and protected routes.
- **User Profiles** — Manage profile information, avatar, and bio.
- **Travel Stories** — Create, view, edit, and delete travel stories.
- **Image Gallery** — Upload multiple images and view them in a gallery.
- **Likes and Comments** — Interact with stories shared by other users.
- **Bookmarks** — Save stories and access them from the Saved Stories page.
- **Search and Filters** — Search by title, description, and destination.
- **Category Filters** — Explore Adventure, Beach, Trekking, Food, Culture, Nature, and Other stories.
- **Transport Information** — View available travel options, including Train, Bus, Vehicle, and Flight.
- **Family Friendly** — Identify destinations suitable for families and elderly travelers.
- **Popular and Recent Stories** — Discover trending stories and the latest travel experiences.
- **Story View Counter** — Track story views.
- **Contact and Feedback** — Submit feedback through the contact form.
- **Responsive Design** — Interface designed for mobile, tablet, and desktop screens.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Multer
- Cloudinary

*The technologies and features listed above should be checked against the actual project implementation.*

## 📁 Project Structure

```text
Travel Story Website/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── index.html
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a compatible MongoDB instance
- Cloudinary account for image uploads
- Git (optional, for version control)

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd "Travel Story Website"
```

Replace `YOUR_REPOSITORY_URL` with your actual repository URL.

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend/` directory using the actual variable names expected by the backend.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use your own credentials. Never commit your `.env` file or expose your secrets publicly.

### 4. Start the backend

Run the command supported by your backend's `package.json`, for example:

```bash
npm run dev
```

If the project does not have a `dev` script, check the available scripts and use the appropriate start command.

### 5. Install frontend dependencies

Open another terminal from the project root:

```bash
cd frontend
npm install
```

### 6. Configure the frontend API URL

Check `frontend/src/services/api.js` and the existing environment configuration. Set the API base URL according to the backend address and the configuration already used by the project.

For a local backend running on port 5000, the API base URL might be:

```text
http://localhost:5000/api
```

Use this only if it matches the backend's actual route configuration.

### 7. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal, usually `http://localhost:5173`.

## 🔌 API Overview

The following are expected API areas based on the project requirements. Exact paths and supported methods depend on the implemented backend.

| Feature | Purpose |
|---|---|
| Authentication | Register, login, and retrieve the current user |
| Stories | Create, list, retrieve, update, and delete stories |
| Likes | Like or unlike a story |
| Comments | Add, retrieve, and delete comments |
| Bookmarks | Save or remove saved stories |
| User Profile | View and update profile information |
| Search and Filters | Search and filter stories with pagination |
| Popular Stories | Retrieve popular travel stories |
| Recent Stories | Retrieve recently created stories |
| Contact | Submit contact or feedback information |
| Health Check | Check backend availability |

For exact endpoint paths and request formats, refer to the backend routes and controllers.

## 🧪 Testing

Run the test scripts available in each package.

For example:

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

These commands work only if the corresponding test scripts are configured in the respective `package.json` files.

Check the production frontend build using:

```bash
npm run build
```

Run it from the `frontend/` directory.

Recommended manual checks:

- Register and log in with a test account.
- Create, edit, and delete a travel story.
- Verify image uploads.
- Test likes, comments, and bookmarks.
- Test search, filters, and pagination.
- Verify profile editing and contact form submission.
- Check protected routes and story ownership permissions.
- Test mobile and desktop layouts.

## 🔐 Security

- Store passwords using secure password hashing.
- Verify JWTs on protected backend routes.
- Enforce story ownership checks on the server.
- Validate user input and uploaded files.
- Keep environment variables and API secrets private.
- Use appropriate CORS settings and production security configuration.
- Never commit `.env` files or real credentials.

## 🌐 Deployment

The project can be deployed using services such as:

- **Frontend:** Vercel or Netlify
- **Backend:** Render or another Node.js hosting service
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary

Before deployment, configure the production environment variables, frontend API URL, CORS allowed origins, and hosting build/start commands. Verify the deployed application using the production URLs.

## 🔮 Future Improvements

Potential improvements include enhanced destination discovery, better image optimization, additional accessibility enhancements, and expanded automated test coverage.

## 👨‍💻 Project Information

**Project Name:** Travel Story Website

**Technology:** MERN Stack

**Project Type:** Full-Stack Web Development / College Project

## 📄 License

This project is developed for educational purposes. Add an appropriate license if you intend to distribute or reuse the project publicly.