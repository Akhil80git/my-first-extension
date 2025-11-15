const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "liveData.json");

// Helper function to read liveData.json
function readData() {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

// Helper function to write liveData.json
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Save folder snapshot
app.post("/save", (req, res) => {
  const { folderType, files } = req.body;
  if (!folderType || !files) return res.status(400).json({ error: "folderType and files required" });

  const data = readData();
  const version = (data[folderType].latestVersion || 0) + 1;
  const timestamp = new Date().toISOString();

  data[folderType].latestVersion = version;
  data[folderType].versions.push({ version, timestamp, files });
  writeData(data);

  res.json({ message: "Saved successfully", version });
});

// Fetch specific version
app.get("/fetch/:folderType/:version", (req, res) => {
  const { folderType, version } = req.params;
  const data = readData();
  const v = data[folderType].versions.find(v => v.version == version);
  if (!v) return res.status(404).json({ error: "Version not found" });
  res.json(v);
});

// Fetch all versions (dashboard)
app.get("/fetchDashboard", (req, res) => {
  const data = readData();
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
