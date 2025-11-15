const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to liveData.json
const DATA_FILE = path.join(__dirname, 'liveData.json');

// Helper: read liveData.json
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ frontend: {latestVersion:0,versions:[]}, backend: {latestVersion:0,versions:[]} }, null, 2));
  }
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

// Helper: write liveData.json
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST /save → Save folder snapshot
app.post('/save', (req, res) => {
  const { folderType, files } = req.body;
  const data = readData();

  if (!data[folderType]) {
    return res.status(400).send({ error: 'Invalid folderType' });
  }

  const newVersion = data[folderType].latestVersion + 1;
  const versionData = {
    version: newVersion,
    timestamp: new Date().toISOString(),
    files
  };

  data[folderType].latestVersion = newVersion;
  data[folderType].versions.push(versionData);
  writeData(data);

  res.send({ message: 'Folder saved', version: newVersion });
});

// GET /fetch/:folderType/:version → Fetch version
app.get('/fetch/:folderType/:version', (req, res) => {
  const { folderType, version } = req.params;
  const data = readData();

  if (!data[folderType]) return res.status(400).send({ error: 'Invalid folderType' });

  const folderVersion = data[folderType].versions.find(v => v.version == version);
  if (!folderVersion) return res.status(404).send({ error: 'Version not found' });

  res.send(folderVersion);
});

// GET /dashboard → show all versions
app.get('/dashboard', (req, res) => {
  const data = readData();
  let html = `<h1>VS Code Folder Versioning Dashboard</h1>`;
  
  ['frontend','backend'].forEach(type => {
    html += `<h2>${type.toUpperCase()}</h2><ul>`;
    data[type].versions.forEach(v => {
      html += `<li>Version ${v.version} - ${v.timestamp}</li>`;
    });
    html += `</ul>`;
  });

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
