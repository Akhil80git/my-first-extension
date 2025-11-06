const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, "liveData.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET latest message
app.get("/get", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(data);
});

// POST new message
app.post("/save", (req, res) => {
  const { latestMessage } = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify({ latestMessage }, null, 2));
  res.json({ success: true, message: "Message saved successfully!" });
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
