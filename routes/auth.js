var express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var router = express.Router();
// const jwtTokens = require("../utils/jwt-helper");
require("dotenv").config(); // Use dotenv to manage environment variables

// Secret key for signing JWTs (kept safe in .env)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use env variable for production

// In-memory user data (for demo purposes; use a real database in production)
let users = [];

/**
 * User registration route
 * Simulates creating a new user by hashing their password and storing it.
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("random");

  try {
    // Check if the user already exists
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
    console.log(req.body);
});

console.log(users)

/**
 * Login route
 * Simulates user authentication and issues a JWT upon successful login.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
});

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    // Attach the user object to the request for use in other routes
    req.user = user;
    next();
  });
};

/**
 * Protected route
 * Requires a valid JWT to access.
 */
router.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

module.exports = router;
