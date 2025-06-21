# 📝 VoxPost – Blogging Platform

Welcome to **VoxPost**, a full-stack blogging platform where users can register, create blog posts with images, like, comment, and manage their own content. Built using the **MERN stack**.

## 🌐 Live Demo

- **Frontend** (Netlify): (https://voxpost-blog-platform.netlify.app/)
- **Backend** (Render): (https://blogging-platform-pkn1.onrender.com/api)

---

## 🚀 Features

- 🔐 User authentication (JWT-based)
- ✍️ Create, edit, delete blog posts
- 🖼️ Upload images (Cloudinary)
- ❤️ Like & comment on posts
- 🔎 Search posts
- 📱 Responsive design (mobile-friendly)
- 👁️ Show/hide password toggle (Font Awesome)

---

## 🛠️ Tech Stack

**Frontend:**
- HTML, CSS, JavaScript
- Font Awesome icons
- Netlify deployment

**Backend:**
- Node.js, Express
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image hosting
- Render deployment

---

## 📂 Project Structure

project-root/
│
├── backend/ # Express server
│ ├── controllers/ # All route controllers
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express routers
│ ├── middleware/ # Auth & upload middleware
│ └── server.js or index.js
│
├── frontend/ # Frontend files
│ ├── index.html
│ ├── style.css
| ├── post.html
| ├── image # Folder
│ └── script.js
│
└── README.md


---

## 📦 Installation (For Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/voxpost.git
cd voxpost

2. Backend Setup

cd backend
npm install

Create a .env file:

PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Run backend:

npm node server.js / nodemon - npm run dev

3. Frontend Setup

cd ../frontend
# Open index.html in browser or serve with Live Server

🔐 Environment Variables

MONGO_URI: MongoDB Atlas connection string

JWT_SECRET: Secret key for JWT

CLOUDINARY_*: Credentials for Cloudinary image upload

📌 Future Improvements

Rich text editing

Tags, categories & filters

User avatars & profiles

Admin dashboard

Email/password recovery

🙌 Author
Jagathish Kumar
• Linkedin - https://www.linkedin.com/in/jagathish-kumar-u/
