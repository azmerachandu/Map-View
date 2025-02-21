

const map = L.map("map", {
    center: [22.305, 87.320],
    zoom: 15,
    zoomControl: false,
    maxZoom: 16,
    minZoom: 16,
    dragging: false,
    scrollWheelZoom: false
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Layer groups
const dronePathLayer = L.layerGroup().addTo(map);
const obstaclesLayer = L.layerGroup().addTo(map);
const noFlyZonesLayer = L.layerGroup().addTo(map);
const markersLayer = L.layerGroup().addTo(map);

// Load obstacles
async function loadObstacles() {
    const response = await fetch("/api/obstacles");
    const obstacles = await response.json();

    obstacles.forEach(obs => {
        L.marker([obs.lat, obs.lon], {
            icon: L.divIcon({
                className: "obstacle-marker",
                html: "🛑",
                iconSize: [20, 20]
            })
        })
        .bindPopup(`Obstacle: ${obs.name}`)
        .addTo(obstaclesLayer);
    });
}

// Load circular no-fly zones
async function loadNoFlyZones() {
    const response = await fetch("/api/no-fly-zones");
    const zones = await response.json();

    zones.forEach(zone => {
        L.circle([zone.lat, zone.lon], {
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.3,
            radius: zone.radius
        })
        .bindPopup(`No-Fly Zone: ${zone.name} (${zone.radius} meters)`)
        .addTo(noFlyZonesLayer);
    });
}

// Calculate and display straight drone path with markers
async function calculateDronePath(start, end) {
    const url = `/api/drone-path?startLat=${start.lat}&startLon=${start.lon}&endLat=${end.lat}&endLon=${end.lon}`;
    const response = await fetch(url);
    const data = await response.json();

    dronePathLayer.clearLayers();
    markersLayer.clearLayers();

    if (data.route && data.route.length > 0) {
        const latlngs = data.route.map(point => [point.lat, point.lon]);
        L.polyline(latlngs, { color: "blue", weight: 4 }).addTo(dronePathLayer);

        // Add start marker
        L.marker([start.lat, start.lon], {
            icon: L.divIcon({
                className: "start-marker",
                html: "🚀",
                iconSize: [30, 20]
            })
        }).addTo(markersLayer);

        // Add destination marker
        const lastPoint = latlngs[latlngs.length - 1];
        L.marker(lastPoint, {
            icon: L.divIcon({
                className: "end-marker",
                html: "🎯",
                iconSize: [30, 20]
            })
        }).addTo(markersLayer);

        // Center map on the path
        const middlePoint = latlngs[Math.floor(latlngs.length / 2)];
        map.setView(middlePoint, 20);
    } else {
        alert("No safe route available.");
    }
}

// Example start and end points
const start = { lat: 22.300, lon: 87.310 };
const end = { lat: 22.310, lon: 87.300 };

// Load map layers and path
loadObstacles();
loadNoFlyZones();
calculateDronePath(start, end);