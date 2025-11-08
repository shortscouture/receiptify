const express = require('express');
const passport = require('../config/passport');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost'
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost'}/dashboard`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.redirect(process.env.FRONTEND_URL || 'http://localhost');
    }
    res.redirect(process.env.FRONTEND_URL || 'http://localhost');
  });
});

// Get current user profile (protected route)
router.get('/profile', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      givenName: req.user.givenName,
      familyName: req.user.familyName
    }
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        givenName: req.user.givenName,
        familyName: req.user.familyName
      }
    });
  }
  res.json({ authenticated: false });
});

module.exports = router;
