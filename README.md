# Career Bridge 🚀

Career Bridge is a full-stack job portal designed to connect **job seekers** with **employers** through a simple and modern platform.

The project combines a React-based frontend with a Node.js/Express backend and MongoDB database, providing the foundation for job discovery, applications, user accounts, employer functionality, and resume/file management.

---

## 🌐 Project Overview

Career Bridge provides a centralized platform where users can:

* Create and manage their accounts
* Explore available job opportunities
* View detailed job information
* Apply for jobs
* Track applications
* Save jobs
* Manage user profiles
* Support employer/company functionality
* Upload files such as resumes
* Authenticate securely using JWT-based authentication

---

## ✨ Features

### 👤 Job Seeker

* User registration and login
* Secure authentication
* Profile management
* Browse job listings
* Search and filter jobs
* View job details
* Apply for jobs
* Track submitted applications
* Save/bookmark jobs

### 🏢 Employer / Company

* Company profile functionality
* Job posting functionality
* Manage job listings
* Manage applications
* Employer verification support

### 🔐 Authentication & Security

* JWT-based authentication
* Password hashing with bcrypt
* HTTP cookie-based authentication
* Protected API routes
* Environment-based configuration
* CORS configuration
* Sensitive credentials excluded from Git

### 📁 File Management

The backend supports file uploads and Cloudinary integration for cloud-based media/file management.

Uploaded local files are excluded from Git using `.gitignore`.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Redux
* Redux Toolkit
* Axios
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Cloudinary
* Cookie Parser
* CORS
* Morgan
* dotenv
* Nodemon

---

## 📂 Project Structure

```text
Career-Bridge/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── service/
│   └── ...
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Requirements

Before running Career Bridge locally, make sure you have:

* Node.js installed
* npm installed
* MongoDB / MongoDB Atlas database
* Cloudinary account for file/media uploads

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Himanshu6389/Career-Bridge.git
```

### 2. Open the project

```bash
cd Career-Bridge
```

---

## 🎨 Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔧 Backend Setup

Move into the backend directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory.

### Backend Environment Variables

```env
PORT=5014
NODE_ENV=development
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Important:** Never commit your `.env` file, MongoDB credentials, JWT secrets, or Cloudinary secrets to GitHub.

The project's `.gitignore` is configured to keep `.env` and uploaded files out of the repository.

---

## ▶️ Run the Backend

From the `server` directory:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5014
```

The frontend communicates with the backend through the configured API base URL.

---

## 🔗 Frontend & Backend

The frontend API configuration is located at:

```text
src/service/api.js
```

The backend API is configured to run locally on:

```text
http://localhost:5014/api/v1
```

You can override the backend URL using the frontend environment variable:

```env
VITE_BACKEND_URL=http://localhost:5014/api/v1
```

---

## 🗄️ Database

Career Bridge uses **MongoDB** with **Mongoose** for database operations.

For local development, MongoDB Atlas can be used instead of installing MongoDB locally.

Example:

```env
MONGO_URI=your_mongodb_atlas_connection_string
```

---

## ☁️ Cloudinary

Cloudinary is used for cloud-based file/media management.

Configure the following variables in `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never publish these credentials publicly.

---

## 🧪 Build the Frontend

To create a production build:

```bash
npm run build
```

The production files are generated in:

```text
dist/
```

The current project successfully builds with Vite.

---

## 🔒 Security

This project uses several security mechanisms, including:

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* HTTP cookies
* CORS configuration
* Environment variables for secrets
* Git exclusion of `.env`
* Git exclusion of uploaded files

### Never commit:

```text
.env
.env.local
.env.production
node_modules/
uploads/
```

---

## 📌 Development Notes

The frontend and backend are maintained inside the same repository:

```text
Career-Bridge/
├── frontend files
└── server/
    └── backend files
```

This makes the project easier to manage, version, and deploy as a single codebase while keeping frontend and backend dependencies separated.

---

## 🚧 Future Improvements

Potential improvements include:

* Job recommendation system
* Advanced job search
* Email notifications
* Application status notifications
* Employer analytics dashboard
* Admin dashboard
* Improved resume management
* Real-time notifications
* Improved validation and error handling
* API documentation
* Automated testing
* Production deployment

---

## 👨‍💻 Author

**Himanshu Kumar**

GitHub:

https://github.com/Himanshu6389

---

## 📄 License

This project is currently intended for educational and development purposes.

A formal open-source license can be added in the future if required.
