# How to Start the Backend Server

## Prerequisites
1. Make sure MongoDB is running on your system
2. Install backend dependencies

## Steps to Start Backend

1. **Open a terminal/command prompt**

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Create a .env file in the root directory with:**
   ```
   MONGO_URI=mongodb://localhost:27017/TechnoAI
   PORT=5000
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   Or if you don't have nodemon:
   ```bash
   node server.js
   ```

6. **Verify the server is running:**
   - You should see: `Server running on port 5000`
   - You should see: `✅ MongoDB connected`

## Troubleshooting

- **Port 5000 already in use**: Change the PORT in .env file to a different port (e.g., 5001)
- **MongoDB connection failed**: Make sure MongoDB is running on your system
- **Module not found errors**: Run `npm install` in the backend directory

## Testing the Backend

Once the server is running, you can test it by:
1. Opening your browser and going to `http://localhost:5000`
2. You should see: "API is working 🚀"

The frontend will automatically test the connection when it loads.
