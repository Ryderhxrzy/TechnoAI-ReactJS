// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import aiRoutes from "./routes/ai.js";
import healthRoutes from "./routes/health.js";

/* Load environment variables from the root directory
dotenv.config({ path: '../.env' });*/

dotenv.config();

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://techno-ai-react-js.vercel.app",
  "https://techno-ai-react-js-ryder-hxrzys-projects.vercel.app",
  "techno-ai-react-hpnrf02gn-ryder-hxrzys-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/health", healthRoutes);

// ✅ Test route - FIXED
app.get("/", (req, res) => {
  res.json({ 
    message: "API is working 🚀",
    timestamp: new Date().toISOString(),
    port: process.env.PORT
  });
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT
  });
});

// ✅ Server Listen - FIXED
const PORT = process.env.PORT || 10000; // ✅ Change to 10000 to match Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});