const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../prisma');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.account.findFirst({
          where: { 
            googleId: profile.id 
          }
        });

        // If user does not exist, create new user
        if (!user) {
          // Use Google email as username
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          
          // Check if email is already used by another account
          const existingUserWithEmail = await prisma.account.findUnique({
            where: { username: email }
          });
          
          if (existingUserWithEmail) {
            console.log('This email has been registered');
            return done(null, false, { message: 'EMAIL_EXISTS', email: email });
          }
          
          // Create new user
          user = await prisma.account.create({
            data: {
              username: email,
              googleId: profile.id,
              role: 'USER',
              // For OAuth users, we don't set a password, or set a random password
              password: Math.random().toString(36).slice(-10)
            }
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 