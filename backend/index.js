const express = require("express");
const app = express();
const User = require("./models/user");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const session = require("express-session");
const passport = require("passport");
process.env.DEBUG = 'passport:*';
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const PORT = process.env.PORT || 5000;
const backendBase =
  process.env.NODE_ENV === "production"
    ? process.env.BACKEND_URL || `http://localhost:${PORT}`
    : `http://localhost:${PORT}`;

const tasksRoutes = require("./routes/tasks");

const userRoutes = require("./models/user");
app.use("/api/user", userRoutes);

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[DEBUG] SERVER RECEIVED: ${req.method} ${req.url}`);
    next(); // IMPORTANT: Pass control to the next middleware/route handler
});

// Session
app.use(session({
  secret: "ghibli-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
     secure: false,
  sameSite: "lax"}
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialize
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: "986344866093-3cji0flbbd9fc2mc9uejrde8gbamtg8h.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:5000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

//Check Auth status
app.get("/api/auth/status", (req, res) => {
  console.log("backend: received request for /api/auth/status");
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

//Auth routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//Save login session
app.get("/auth/google/callback", (req, res, next) => {

  passport.authenticate("google", (err, user, info) => {

    if (err) {
      console.error("❌ Auth error:", err);
      return res.redirect("/register.html");
    }

    if (!user) {
      console.warn("⚠️ No user returned:", info);
      return res.redirect("/register.html");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("❌ Login error:", err);
        return res.redirect("/register.html");
      }

      console.log("✅Google login successful", user);
      req.session.save(() => {
        res.redirect("/ghibli.html");
      });
    });
  })(req, res, next);
});

// Frontend path
const frontendPath = path.resolve(__dirname, "../frontend");
console.log("Frontend path is:", frontendPath);

// Serve register.html on root 
app.get("/", (req, res) => {
  console.log("Serving register.html");
  res.sendFile(path.join(frontendPath, "register.html"));});

//serve static assets 
app.use(express.static(frontendPath));

// Users file path
const USERS_FILE = path.resolve(__dirname, "../frontend/users.json");

//Register user
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Missing fields" });

  let users = {};
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (users[username]) {
    return res.status(409).json({ success: false, message: "Username already taken" });
  }

  users[username] = password;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return res.json({ success: true });
});

// Login save sessions
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  let users = {};
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (users[username] && users[username] === password) {
    // ✅ Store user info in session
    req.login({ username }, (err) => {
      if (err) {
        console.error("Login session error:", err);
        return res.status(500).json({ success: false, message: "Session error" });
      }

      return res.json({ success: true });
    });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

//Logout session
app.post("/api/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid"); //clear session cookie
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

//tasks saving session
app.use("/api/tasks", tasksRoutes);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ghibliCalendar", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));
// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

//saving user data 
app.use(async (req, res, next) => {
  let user = await User.findOne({ username: "default-user" });

  if (!user) {
    user = new User({ username: "default-user" });
    await user.save();
  }
  console.log("[DEBUG attached user ID:", user_id)

  req.user = user;
  next();
});

const listEndpoints = require('express-list-endpoints');
console.log("✅ Registered routes:");
console.log(listEndpoints(app));

