// server.js
const express = require("express");
const redis = require("redis");
const http = require("http");

const app = express();
const redisClient = redis.createClient();

// Handle Redis connection errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Middleware function to check Redis cache
function cache(req, res, next) {
}

//Getting IP Address
app.get("/get-ip", (req, res) => {
  const ipAddress = req.ip;
  res.json({ ip: ipAddress });

  //Saving user IP address in redis.
  //redis does not have this address as a key
  //////set address as a key and 1 as the value and expiration as 1 hour
  //else if redis does have this key
  /////is the value < 100
  ////then delete key, create it again with an increment of 1 and update expire time
  //else user is capped 
  /////
});

// Routes
app.get("/check", (req, res) => {
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
