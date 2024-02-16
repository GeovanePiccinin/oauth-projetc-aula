import "dotenv/config";
import session from "express-session";
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";

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

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

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

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/github/callback",
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

app.get("/", (req, res) => {
  res.render("pages/index.ejs");
});

app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});

app.get("logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/google/profile",
    failureRedirect: "./login",
  })
);

app.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/github/profile",
    failureRedirect: "./login",
  })
);

app.get("/github/profile", checkAuthenticated, (req, res) => {
  console.log("user", req.user);

  res.render("pages/profile.ejs", {
    username: req.user.username,
    profileUrl: req.user.profileUrl,
    profile: "github",
  });
});

app.get("/google/profile", checkAuthenticated, (req, res) => {
  console.log("user", req.user);

  res.render("pages/profile.ejs", {
    name: req.user.displayName,
    pic: req.user.picture,
    email: req.user.emails[0].value,
    profile: "google",
  });
});

app.listen(3000, () => console.log("App is running "));
