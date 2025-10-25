# 🧠 TechnoAI-ReactJS

**Techno.ai** — an AI-powered platform built with the **MERN stack** that provides **BSIT students** with personalized step-by-step guidance, coding help, and clear explanations.

---

## 🚀 Overview

Techno.ai is designed to make IT education easier and smarter.  
It helps students understand code, generate examples, and learn efficiently using an AI tutor built with Gemini API and Google OAuth integration.

---

## ⚙️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas
- **AI Integration:** Gemini API
- **Authentication:** Google OAuth
- **Full Stack Framework:** MERN

---

## 📁 Folder Structure

Here’s the full project structure for **TechnoAI-ReactJS**:

```
/TechnoAI-ReactJS
│
├── /backend
│   ├── /models
│   │   └── Message.js
│   │
│   ├── /routes
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── health.js
│   │   └── messages.js
│   │
│   ├── server.js
│   └── package.json
│    
│
├── /src
│   ├── index.html
│   ├── Login.jsx
│   ├── Register.jsx
│   └── (other necessary frontend files)
│
├── .env
├── vite.config.js
├── package.json
└── README.md
```

---

## 🧩 Features

- 🤖 Personalized AI tutoring for BSIT students  
- 🧾 Step-by-step coding help and explanations  
- 🔐 Google OAuth login integration  
- 💬 Gemini API for AI-generated content  
- 🗃️ MongoDB Atlas for secure data storage  
- 🌍 RESTful API communication between backend and frontend  

---

## 📋 Prerequisites

Before running the project, ensure you have:
- Node.js (v18 or newer)
- npm (or Yarn)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth)
- Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

---

## ⚙️ Environment Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/TechnoAI-ReactJS.git
cd TechnoAI-ReactJS
```

### 2️⃣ Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ..
npm install
```

---

## 🗝️ 3️⃣ Create `.env` Files

You’ll need two environment files — one for the backend and one for the frontend.

### Backend `.env` (inside `/backend/.env`)
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/technoai?retryWrites=true&w=majority
PORT=5000
```

### Frontend `.env` (inside the root `/TechnoAI-ReactJS/.env`)
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_APP_GEMINI_API_KEY=your-gemini-api-key
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ▶️ 4️⃣ Run the Application

### Start the Backend
```bash
cd backend
npm run dev
```
or
```bash
node server.js
```

### Start the Frontend
```bash
cd ..
npm run dev
```

Once both are running, open your browser and go to:
```
http://localhost:5173
```

---

## 🌍 Environment Variables Summary

| Variable | Location | Description | Example |
|-----------|-----------|--------------|----------|
| `MONGO_URI` | Backend | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/technoai |
| `PORT` | Backend | Backend server port | 5000 |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth Client ID | your-google-client-id.apps.googleusercontent.com |
| `VITE_APP_GEMINI_API_KEY` | Frontend | Gemini API Key | AIzaSy... |
| `VITE_API_BASE_URL` | Frontend | API base URL | http://localhost:5000/api |

---

## 🏗️ Build and Deployment

### Build the Frontend
```bash
npm run build
```
This will generate a `/dist` folder, ready for deployment (Netlify, Vercel, etc.).

### Deploy the Backend
Upload `/backend` to Render, Railway, or your preferred hosting provider.  
Be sure to configure all environment variables in your host’s dashboard.

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|-----------|
| API not connecting | Check `VITE_API_BASE_URL` and CORS setup |
| MongoDB connection fails | Verify credentials and IP whitelist |
| `.env` not loading | Ensure correct file paths and restart server |
| Frontend variables undefined | All Vite env vars must start with `VITE_` |

---

## 🔒 Security Tips

- Never expose API keys or credentials in public repos  
- Always include `.env` in `.gitignore`  
- Use HTTPS in production  
- Sanitize all user input  
- Keep dependencies updated  

---

## 🧑‍💻 Contributing

1. Fork the repository  
2. Create a feature branch  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes  
   ```bash
   git commit -m "Added new feature"
   ```
4. Push to your branch  
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request  

---

## 🧾 .gitignore Example

```
/node_modules
/dist
.env
/backend/.env
.DS_Store
```

---

## 📄 License
This project is licensed under the **MIT License**.

---

## 🌐 Website
🔗 ([https://techno.ai](https://techno-ai-react-js.vercel.app/))
