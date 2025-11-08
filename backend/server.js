require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const passport = require('./config/passport');
const { sequelize, initializeModels } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gmailRoutes = require('./routes/gmail');
const receiptsRoutes = require('./routes/receipts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - important for OAuth
const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost', 'http://localhost:3001'];
const envAllowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...envAllowedOrigins, ...defaultAllowedOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Receiptify API with Google OAuth', 
        version: '1.0.0',
        endpoints: {
            googleLogin: '/api/auth/google',
            status: '/api/auth/status',
            profile: '/api/auth/profile',
            logout: '/api/auth/logout'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/receipts', receiptsRoutes);

const startServer = async () => {
    try {
        initializeModels();
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Google OAuth callback: ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;