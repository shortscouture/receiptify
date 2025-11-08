const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { models } = require('../models');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    accessType: 'offline',
    prompt: 'consent'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const User = models.User;
      const UserToken = models.UserToken;
      
      // Extract user info from Google profile
      const googleId = profile.id;
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const name = profile.displayName;
      const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
      const givenName = profile.name && profile.name.givenName ? profile.name.givenName : null;
      const familyName = profile.name && profile.name.familyName ? profile.name.familyName : null;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Find or create user
      let user = await User.findOne({ where: { googleId } });

      if (!user) {
        // Check if user exists with this email
        user = await User.findOne({ where: { email } });
        
        if (user) {
          // Update existing user with Google ID
          user.googleId = googleId;
          user.picture = picture;
          user.givenName = givenName;
          user.familyName = familyName;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId,
            email,
            name,
            picture,
            givenName,
            familyName
          });
        }
      } else {
        // Update user info on each login
        user.name = name;
        user.email = email;
        user.picture = picture;
        user.givenName = givenName;
        user.familyName = familyName;
        await user.save();
      }

      // Store or update OAuth tokens
      if (accessToken) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Default 1 hour expiry

        await UserToken.upsert({
          userId: user.id,
          accessToken: accessToken,
          refreshToken: refreshToken || null,
          expiryDate: expiryDate,
          scope: profile._json.scope || 'profile email'
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const User = models.User;
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
