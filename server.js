const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestMessage = "";

// 🟢 Read saved message from liveData.json (if exists)
try {
  const data = fs.readFileSync("liveData.json", "utf8");
  latestMessage = JSON.parse(data).latestMessage || "";
} catch (err) {
  latestMessage = "";
}

// 🟢 GET route (Frontend will fetch this)
app.get("/get", (req, res) => {
  res.json({ latestMessage });
});

// 🟢 POST route (VS Code extension will send message here)
app.post("/update", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  latestMessage = message;
  fs.writeFileSync("liveData.json", JSON.stringify({ latestMessage }, null, 2));
  res.json({ success: true, message: "Message updated successfully!" });
});

// 🟢 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
