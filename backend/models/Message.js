import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat_title: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  has_code: {
    type: Boolean,
    default: false
  },
  sequence: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ sender: 1, chat_title: 1, sequence: 1 });

export default mongoose.model('Message', messageSchema);
