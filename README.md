# 🧠 Techno.ai

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

/Techno.ai  
│  
├── /backend               # Express.js + MongoDB backend  
│   ├── server.js  
│   ├── package.json  
│   └── .env  
│  
├── /TechnoAI-ReactJS      # React frontend (Vite)  
│   ├── src/  
│   ├── vite.config.js  
│   ├── package.json  
│   └── .env  
│  
└── README.md

---

## 🧩 Features

- 🤖 Personalized AI help for BSIT students  
- 🧾 Step-by-step code explanations  
- 🔐 Google OAuth login  
- 💬 Real-time responses using Gemini API  
- 🗃️ MongoDB integration  
- 🌍 RESTful API communication  

---

## 📋 Prerequisites

Make sure you have installed:
- Node.js (v18 or newer)
- npm
- MongoDB Atlas
- Google Cloud Console (for OAuth)
- Gemini API key

---

## ⚙️ Environment Setup

### 1️⃣ Clone the repository
git clone https://github.com/<your-username>/Techno.ai.git  
cd Techno.ai

### 2️⃣ Install dependencies

#### Backend
cd backend  
npm install

#### Frontend
cd ../TechnoAI-ReactJS  
npm install

---

## 🗝️ 3️⃣ Create .env Files

### Backend (.env inside /backend)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/technoai?retryWrites=true&w=majority  
PORT=5000

### Frontend (.env inside /TechnoAI-ReactJS)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com  
VITE_APP_GEMINI_API_KEY=your-gemini-api-key  
VITE_API_BASE_URL=http://localhost:5000/api

---

## ▶️ 4️⃣ Run the Application

### Start Backend Server
cd backend  
npm run dev  
# or  
node server.js

### Start Frontend (Vite React)
cd ../TechnoAI-ReactJS  
npm run dev

Then open your browser and go to:  
http://localhost:5173

---

## 🌍 Environment Variables Summary

| Variable | Location | Description | Example |
|-----------|-----------|--------------|----------|
| MONGO_URI | Backend | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/technoai |
| PORT | Backend | Server port | 5000 |
| VITE_GOOGLE_CLIENT_ID | Frontend | Google OAuth Client ID | your-google-client-id.apps.googleusercontent.com |
| VITE_APP_GEMINI_API_KEY | Frontend | Gemini AI API Key | AIzaSy... |
| VITE_API_BASE_URL | Frontend | Backend API URL | http://localhost:5000/api |

---

## 🧾 Example Root Scripts (optional)

In your root folder, you can add a package.json with:

{
  "scripts": {
    "install:all": "cd backend && npm install && cd ../TechnoAI-ReactJS && npm install",
    "dev": "concurrently \"cd backend && npm run dev\" \"cd TechnoAI-ReactJS && npm run dev\"",
    "start": "node backend/server.js"
  },
  "devDependencies": {
    "concurrently": "^7.0.0"
  }
}

---

## 🏗️ Build and Deploy

### Frontend
cd TechnoAI-ReactJS  
npm run build  

The production-ready files will be in `/dist`, which you can deploy on **Vercel**, **Netlify**, or any static host.

### Backend
Deploy `/backend` to **Render**, **Railway**, or **VPS**.  
Be sure to add your environment variables on the hosting dashboard.

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|-----------|
| API not connecting | Check `VITE_API_BASE_URL` and CORS settings |
| MongoDB connection fails | Verify `MONGO_URI` and IP whitelist |
| .env not loading | Restart the server and verify variable names |
| Frontend env vars undefined | Vite requires env vars to start with `VITE_` |

---

## 🔒 Security Tips

- Never expose API keys or secrets publicly  
- Always add `.env` and `node_modules` to `.gitignore`  
- Use HTTPS in production  
- Sanitize user inputs and validate requests  

---

## 🧑‍💻 Contributing

1. Fork the repository  
2. Create a new branch  
   git checkout -b feature/your-feature  
3. Commit your changes  
   git commit -m "Add new feature"  
4. Push and open a Pull Request  

---

## 🧾 .gitignore Example

/node_modules  
/dist  
.env  
/backend/.env  
/TechnoAI-ReactJS/.env  
.DS_Store

---

## 📄 License
This project is licensed under the **MIT License**.

---

## 🌐 Website
🔗 [https://techno.ai](https://techno-ai-react-js.vercel.app/)
