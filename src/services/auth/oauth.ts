import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import UserModel from "../../models/users";
import { authenticate } from "./index";

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      callbackURL: `${process.env.API_URL}/users/googleRedirect`,
      passReqToCallback: true,
    },
    async (
      req,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      next
    ) => {
      const newUser = {
        googleId: profile.id,
        name: profile.name!.givenName,
        surname: profile.name!.familyName,
        username: profile.emails![0].value,
        role: "user",
        refreshTokens: [],
      };
      try {
        const user = await UserModel.findOne({ googleId: profile.id });

        if (user) {
          const tokens = await authenticate(user);
          next(null, { user, tokens });
        } else {
          const createdUser = new UserModel(newUser);
          await createdUser.save();
          const tokens = await authenticate(createdUser);
          next(null, { user: createdUser, tokens });
        }
      } catch (error) {
        next(error);
      }
    }
  )
);

passport.serializeUser(function (user, next) {
  next(null, user);
});
