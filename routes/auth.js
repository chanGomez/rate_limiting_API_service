const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db"); // Import the PostgreSQL db from db.js
const router = express.Router();
const { authenticateToken } = require("../middleware/authorization");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Registration route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const userExistsQuery = "SELECT * FROM users WHERE username = $1";
    const userExists = await db.query(userExistsQuery, [username]);

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertUserQuery =
      "INSERT INTO users (username, password) VALUES ($1, $2)";
    await db.query(insertUserQuery, [username, hashedPassword]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});


// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const findUserQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await db.query(findUserQuery, [username]);

    if (userResult.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult[0];

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Add 2 factor authentication here!!!

    // Generate a JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    res.json("successfully logged in", "token: " + { token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
});

//Dashboard route where only authorized users can access
//Require authorization middleware
router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the dashboard" });
});

// Logout route (Token blacklisting)
router.post("/logout", async (req, res) => {
  const token = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    // Add token to the blacklist
    const insertTokenQuery = 'INSERT INTO token_blacklist (token) VALUES ($1)';
    await db.query(insertTokenQuery, [token]);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error: error.message });
  }
});



 module.exports = router;