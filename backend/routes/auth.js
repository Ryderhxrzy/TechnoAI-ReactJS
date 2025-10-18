// routes/auth.js
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const router = express.Router();

// User Schema
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.method === 'email';
    }
  },
  profile: {
    type: String,
    default: null
  },
  method: {
    type: String,
    enum: ['email', 'google'],
    required: true
  },
  agreed_to_terms: {
    type: Boolean,
    required: true,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Google login/register endpoint
router.post('/google', async (req, res) => {
  try {
    const { full_name, email, profile, method, agreed_to_terms } = req.body;

    // Validate required fields
    if (!full_name || !email || !method) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, and method are required' 
      });
    }

    // Validate method
    if (method !== 'google') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid method. Use "google" for Google authentication' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // Check if existing user was registered with Google
      if (existingUser.method !== 'google') {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already registered with email/password. Please use email login instead.' 
        });
      }
      
      // User exists and was registered with Google, return user data (LOGIN)
      return res.json({
        success: true,
        message: 'Google login successful',
        user: {
          id: existingUser._id,
          full_name: existingUser.full_name,
          email: existingUser.email,
          profile: existingUser.profile,
          method: existingUser.method,
          agreed_to_terms: existingUser.agreed_to_terms,
          created_at: existingUser.created_at
        }
      });
    } else {
      // User doesn't exist, validate agreement for NEW REGISTRATION
      if (!agreed_to_terms) {
        return res.status(400).json({ 
          success: false, 
          message: 'You must agree to the Terms of Service and Privacy Policy to register' 
        });
      }

      // Create new Google user
      const newUser = new User({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        password: null, // No password for Google users
        profile: profile || null,
        method: 'google',
        agreed_to_terms: agreed_to_terms,
        created_at: new Date()
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        success: true,
        message: 'Google registration successful',
        user: {
          id: savedUser._id,
          full_name: savedUser.full_name,
          email: savedUser.email,
          profile: savedUser.profile,
          method: savedUser.method,
          agreed_to_terms: savedUser.agreed_to_terms,
          created_at: savedUser.created_at
        }
      });
    }

  } catch (error) {
    console.error('Google auth error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, profile, method, agreed_to_terms } = req.body;

    // Validate required fields
    if (!full_name || !email || !method) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, and method are required' 
      });
    }

    // Validate agreement to terms
    if (!agreed_to_terms) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must agree to the Terms of Service and Privacy Policy to register' 
      });
    }

    // Validate method
    if (!['email', 'google'].includes(method)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid method. Use "email" or "google"' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    let hashedPassword = null;
    if (method === 'email') {
      if (!password || password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        });
      }
      // Hash password for email registration
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Create new user
    const newUser = new User({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      profile: method === 'google' ? profile : null,
      method,
      agreed_to_terms: agreed_to_terms,
      created_at: new Date()
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        full_name: savedUser.full_name,
        email: savedUser.email,
        profile: savedUser.profile,
        method: savedUser.method,
        agreed_to_terms: savedUser.agreed_to_terms,
        created_at: savedUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user registered with email method
    if (user.method !== 'email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please use Google to sign in' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        profile: user.profile,
        method: user.method,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;