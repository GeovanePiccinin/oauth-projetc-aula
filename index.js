import "dotenv/config";
import session from "express-session";
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("./login");
};

const authUser = (request, accessToken, refreshToken, profile, done) => {
  console.log("profile", profile);
  return done(null, profile);
};
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback",
      passReqToCallback: true,
    },
    authUser
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/login", (req, res) => {
  res.render("pages/index.ejs");
});

app.get("logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/profile",
    failureRedirect: "./login",
  })
);

app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("pages/profile.ejs", {
    name: req.user.displayname,
    pic: req.user._json.pictuire,
    email: req.user.emails[0].value,
    profile: "google",
  });
});

app.listen(3000, () => console.log("App is running "));
