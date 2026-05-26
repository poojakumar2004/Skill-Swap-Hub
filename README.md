# 🚀 Skill Swap Hub

A full-stack Skill Exchange Platform built using **React.js** for the frontend and **Node.js + Express.js** for the backend.
This project helps users connect with others to **teach, learn, and exchange skills** through an interactive and user-friendly platform.

---

# 📌 Features

* 👤 User Registration & Login
* 🧑‍🏫 Add Skills You Can Teach
* 📚 Add Skills You Want to Learn
* 🔍 Search and Explore Skills
* 🤝 Skill Matching System
* 📊 User Dashboard
* ✏️ Update and Manage Profile
* ⚡ Fast and Responsive Frontend
* 🌐 REST API Backend
* 💾 MongoDB Database Integration

---

# 🏗️ Project Structure

```bash
Skill-Swap-Hub/
│
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── server/                 # Backend (Node + Express)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/Skill-Swap-Hub.git
cd Skill-Swap-Hub
```

---

## 2️⃣ Setup Backend (Server)

```bash
cd server
npm install
```

Run Backend:

```bash
npm run dev
```

Server will run on:

```bash
http://localhost:5000
```

---

## 3️⃣ Setup Frontend (Client)

```bash
cd client
npm install
npm start
```

Frontend will run on:

```bash
http://localhost:3000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

# 🔗 API Endpoints (Example)

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |
| GET    | /api/users         | Get all users |
| POST   | /api/skills        | Add skill     |
| PUT    | /api/skills/:id    | Update skill  |
| DELETE | /api/skills/:id    | Delete skill  |

---

# 🛠️ Tech Stack

## Frontend:

* React.js
* Axios
* React Router
* HTML5
* CSS3

## Backend:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* CORS
* Dotenv

---

# 📷 Screenshots

Add screenshots here after running the project.

Example:

* Home Page
* Login Page
* Dashboard
* Skill Match Page

---

# 🚀 Future Improvements

* 💬 Real-time Chat System
* 📹 Video Call Integration
* ⭐ Ratings & Reviews
* 🔔 Notifications
* 🤖 AI-based Skill Recommendations
* 📱 Mobile App Version

---

# 👨‍💻 Author

**Pooja Kumar GitHub**:[https://github.com/poojakumar2004]

---

# 📄 License

This project is for academic purpose and practice.
