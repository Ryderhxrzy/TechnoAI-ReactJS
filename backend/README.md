# TechnoAI Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=mongodb://localhost:27017/TechnoAI
PORT=5000
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Messages
- `GET /api/messages/titles/:userId` - Get all chat titles for a user
- `GET /api/messages/chat/:userId/:title` - Get messages for a specific chat
- `POST /api/messages` - Save a single message
- `POST /api/messages/batch` - Save multiple messages
- `DELETE /api/messages/chat/:userId/:title` - Delete a chat and all its messages

## Database Schema

### Message Collection
- `_id`: ObjectId
- `chat_title`: String (required)
- `sender`: ObjectId (user ID or "bot")
- `content`: String (required)
- `has_code`: Boolean (default: false)
- `sequence`: Number (required)
- `timestamp`: Date (default: Date.now)
