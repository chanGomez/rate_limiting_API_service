const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db"); // Import the PostgreSQL db from db.js
const router = express.Router();
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const bodyParser = require("body-parser");
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

// ----------------------------------------------2 Factor Auth

// Fake database to store user info and public key credentials
const users = new Map(); // In a real app, use a proper database

// For demo purposes, we'll hardcode user details
const userId = '12345'; // User's unique identifier in your system

app.post("/generate-registration-options", (req, res) => {
  const user = {
    id: userId,
    username: "chantal@example.com", // User's email or unique identifier
    displayName: "Chantal Gomez",
  };

  const opts = generateRegistrationOptions({
    rpName: "Your App Name", // Relying Party (RP) name (your application name)
    rpID: "localhost", // Your domain or app ID
    userID: user.id, // Unique user ID in your system
    userName: user.username, // User's unique username/email
    userDisplayName: user.displayName,
    attestationType: "none", // Use 'none' to keep it simple for most cases
    authenticatorSelection: {
      userVerification: "required",
      authenticatorAttachment: "platform", // 'platform' for biometric auth on the device
    },
  });

  // Send the generated options to the client
  res.json(opts);
});

// Endpoint to verify the registration response (user saves public key credential)
app.post('/verify-registration', async (req, res) => {
  const { body } = req;

  const expectedChallenge = '...' // Retrieve challenge sent during registration

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verification.verified) {
      const { credentialID, credentialPublicKey } = verification.registrationInfo;

      // Store the credential ID and public key in your user database
      users.set(userId, { credentialID, credentialPublicKey });

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to generate authentication options (for user login)
app.post('/generate-authentication-options', (req, res) => {
  const user = users.get(userId); // Retrieve user from database

  const opts = generateAuthenticationOptions({
    allowCredentials: [{
      id: user.credentialID,
      type: 'public-key',
    }],
    userVerification: 'required',
  });

  res.json(opts);
});

// Endpoint to verify the signed challenge (complete login)
app.post('/verify-authentication', async (req, res) => {
  const { body } = req;

  const expectedChallenge = '...' // Retrieve challenge sent during login

  try {
    const user = users.get(userId); // Retrieve user from database

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      authenticator: {
        credentialPublicKey: user.credentialPublicKey,
        credentialID: user.credentialID,
        counter: 0, // Set to the last known counter for replay protection
      },
    });

    if (verification.verified) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


 module.exports = router;