const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require('cors');
// Serve static files from the client app
app.use(express.static(path.join(__dirname, "../client/public")));
app.use(cors());

// Or, manually set headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Load obstacles from JSON file
const obstacles = JSON.parse(fs.readFileSync(path.join(__dirname, "../client/public/data/obstacles.json"), "utf8"));

// Load no-fly zones from JSON file
const noFlyZones = JSON.parse(fs.readFileSync(path.join(__dirname, "../client/public/data/noFlyZones.json"), "utf8"));

// Endpoint to get obstacles
app.get("/api/obstacles", (req, res) => {
    res.json(obstacles);
});

// Endpoint to get circular no-fly zones
app.get("/api/no-fly-zones", (req, res) => {
    res.json(noFlyZones);
});

// Serve React app
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public", "index.html"));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
