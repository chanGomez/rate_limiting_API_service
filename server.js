// server.js
const express = require("express");
const redis = require("redis");

const app = express();
const redisClient = redis.createClient();

// Handle Redis connection errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Middleware function to check Redis cache
function cache(req, res, next) {
}

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/rate", cache, (req, res) => {
  const apiResponse = { message: "This is some data from the API" };

  res.status(200).json(apiResponse);
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
