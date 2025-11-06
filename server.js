// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Temporary variable to hold message
let latestMessage = "";

// 🟢 API to receive data from VS Code extension
app.post('/update', (req, res) => {
  const { message } = req.body;
  if (message) {
    latestMessage = message;
    console.log("📩 Received from extension:", message);
    res.json({ success: true, msg: 'Message received successfully' });
  } else {
    res.status(400).json({ success: false, msg: 'No message received' });
  }
});

// 🟢 API to send data to frontend
app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
});

// 🟢 Serve frontend page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server start
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
