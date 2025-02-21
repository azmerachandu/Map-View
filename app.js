

const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Dummy obstacles (10-15 points)
const obstacles = [
    { name: "Tower 1", lat: 22.303, lon: 87.315 },
    { name: "Building 2", lat: 22.308, lon: 87.325 },
    { name: "Crane 3", lat: 22.306, lon: 87.320 },
    { name: "Tree 4", lat: 22.304, lon: 87.318 },
    { name: "Pole 5", lat: 22.302, lon: 87.316 },
    { name: "Tower 6", lat: 22.307, lon: 87.322 },
    { name: "Building 7", lat: 22.310, lon: 87.328 },
    { name: "Crane 8", lat: 22.305, lon: 87.319 },
    { name: "Tree 9", lat: 22.301, lon: 87.313 },
    { name: "Pole 10", lat: 22.309, lon: 87.327 }
];

// Dummy circular no-fly zones
const noFlyZones = [
    { name: "No-Fly Zone 1", lat: 22.305, lon: 87.320, radius: 300 }, // 300 meters
    { name: "No-Fly Zone 2", lat: 22.310, lon: 87.325, radius: 400 }  // 400 meters
];

// Endpoint to get obstacles
app.get("/api/obstacles", (req, res) => {
    res.json(obstacles);
});

// Endpoint to get circular no-fly zones
app.get("/api/no-fly-zones", (req, res) => {
    res.json(noFlyZones);
});

// Calculate direct drone path avoiding obstacles and no-fly zones
app.get("/api/drone-path", (req, res) => {
    const { startLat, startLon, endLat, endLon } = req.query;

    if (!startLat || !startLon || !endLat || !endLon) {
        return res.status(400).json({ error: "Start and end coordinates are required." });
    }

    // Generate straight path with intermediate points
    const path = generateStraightPath(
        { lat: parseFloat(startLat), lon: parseFloat(startLon) },
        { lat: parseFloat(endLat), lon: parseFloat(endLon) }
    );

    // Filter path to avoid obstacles and no-fly zones
    const safePath = path.filter(point => !isInRestrictedArea(point));

    if (safePath.length === 0) {
        return res.json({ route: [], message: "No safe route available." });
    }

    res.json({ route: safePath });
});

// Generate straight path with intermediate points
function generateStraightPath(start, end, steps = 100) {
    
    const path = [];
    for (let i = 0; i <= steps; i++) {
        const lat = start.lat + (end.lat - start.lat) * (i / steps);
        const lon = start.lon + (end.lon - start.lon) * (i / steps);
        path.push({ lat, lon });
    }
    return path;
}

// Check if a point is inside any obstacle or no-fly zone
function isInRestrictedArea(point) {
    const { lat, lon } = point;

    // Check if point is near any obstacle
    const nearObstacle = obstacles.some(obs => {
        const distance = Math.sqrt((lat - obs.lat) ** 2 + (lon - obs.lon) ** 2) * 111000; // Convert to meters
        return distance <= 50;  // 50-meter buffer around obstacles
    });

    // Check if point is inside any no-fly zone
    const insideNoFlyZone = noFlyZones.some(zone => {
        const distance = Math.sqrt((lat - zone.lat) ** 2 + (lon - zone.lon) ** 2) * 111000;
        return distance <= zone.radius;
    });

    return nearObstacle || insideNoFlyZone;
}

// Root route
app.get("/", (req, res) => {
    res.render("index");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});