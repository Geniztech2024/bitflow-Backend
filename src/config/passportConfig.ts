import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/User';

passport.use(new GoogleStrategy({
  clientID: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  callbackURL: 'your-google-callback-url',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        fullname: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isVerified: true, // Assume verified if authenticated through Google
      });
      await user.save();
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.use(new AppleStrategy({
  clientID: 'your-apple-client-id',
  teamID: 'your-apple-team-id',
  callbackURL: 'your-apple-callback-url',
  keyID: 'your-apple-key-id',
  privateKeyString: 'your-apple-private-key',
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    let user = await User.findOne({ appleId: profile.id });

    if (!user) {
      user = new User({
        fullname: profile.displayName || '',
        email: profile.email || '',
        appleId: profile.id,
        isVerified: true, // Assume verified if authenticated through Apple
      });
      await user.save();
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
