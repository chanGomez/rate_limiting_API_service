const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
app.use(express.json()); // Add this if you handle JSON requests

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.use("/auth", authRouter);

// Error handling middleware (optional)
app.use("*", (err, req, res, next) => {
//   console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
