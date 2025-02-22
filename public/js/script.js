const map = L.map("map", {
    center: [22.305, 87.320],
    zoom: 15,
    zoomControl: true,
    maxZoom: 12,
    minZoom: 18,
    dragging: true,
    scrollWheelZoom: true
});

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const dronePathLayer = L.layerGroup().addTo(map);
const obstaclesLayer = L.layerGroup().addTo(map);
const noFlyZonesLayer = L.layerGroup().addTo(map);
const markersLayer = L.layerGroup().addTo(map);

function createWaypointMarker(lat, lon, label) {
    return L.marker([lat, lon], {
        icon: L.divIcon({
            className: "waypoint-marker",
            html: `<div style='background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 50%; font-weight: bold;'>${label}</div>` ,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(markersLayer);
}

function createDirectionArrow(start, end) {
    const deltaX = end.lon - start.lon;
    const deltaY = end.lat - start.lat;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    const arrowIcon = L.divIcon({
        className: "direction-arrow",
        html: `
            <div style="transform: rotate(${angle}deg);">
                <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.0898 41.3548L23.1738 17.2959L40.7421 27.8208L25.0898 41.3548Z" fill="#E23744"/>
                </svg>
            </div>
        `,
        iconSize: [120, 120],
        iconAnchor: [60, 60]
    });

    return L.marker([(start.lat + end.lat) / 2, (start.lon + end.lon) / 2], { icon: arrowIcon }).addTo(dronePathLayer);
}

async function displayWaypointsAndPath(waypoints) {
    if (waypoints.length !== 3) {
        alert("Please provide three waypoints: start (A), connection (B), and destination (C).");
        return;
    }

    const [start, connection, destination] = waypoints;

    markersLayer.clearLayers();
    dronePathLayer.clearLayers();

    createWaypointMarker(start.lat, start.lon, "A");
    createWaypointMarker(connection.lat, connection.lon, "B");
    createWaypointMarker(destination.lat, destination.lon, "C");

    const path = [
        [start.lat, start.lon],
        [connection.lat, connection.lon],
        [destination.lat, destination.lon]
    ];

    L.polyline(path, { color: "red", weight: 3, dashArray: "5, 5" }).addTo(dronePathLayer);

    // Add directional arrows from A to B and B to C
    createDirectionArrow(start, connection);
    createDirectionArrow(connection, destination);

    // Additional direct dotted line from A to C
    L.polyline([
        [start.lat, start.lon],
        [destination.lat, destination.lon]
    ], { color: "red", weight: 3, dashArray: "5, 5" }).addTo(dronePathLayer);

    const center = {
        lat: (start.lat + destination.lat) / 2,
        lon: (start.lon + destination.lon) / 2
    };

    loadObstacles(center);
    loadNoFlyZones(center);
    map.setView(center, 14);
}

async function loadObstacles(center) {
    obstaclesLayer.clearLayers();
    const response = await fetch("/api/obstacles");
    const obstacles = await response.json();

    obstacles.forEach(obs => {
        const radius = Math.max(5, Math.min(obs.radius, 30));
        L.circle([obs.lat, obs.lon], {
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.3,
            radius: radius
        }).addTo(obstaclesLayer);

        // Add obstacle icon in the circle
        L.marker([obs.lat, obs.lon], {
            icon: L.divIcon({
                className: "obstacle-icon",
                html: `
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="14" fill="#E23744" stroke="black" stroke-width="2"/>
                        <text x="15" y="18" fill="white" font-size="10" font-family="Arial" font-weight="bold" text-anchor="middle">OBS</text>
                    </svg>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(obstaclesLayer);
    });
}

async function loadNoFlyZones(center) {
    noFlyZonesLayer.clearLayers();
    const response = await fetch("/api/no-fly-zones");
    const zones = await response.json();

    zones.forEach(zone => {
        L.circle([zone.lat, zone.lon], {
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.1,
            radius: zone.radius
        }).bindPopup(`No-Fly Zone: ${zone.name}`).addTo(noFlyZonesLayer);
    });
}

// Waypoints based on app.js data
const waypoints = [
    { lat: 22.303, lon: 87.305 }, // A (Start)
    { lat: 22.306, lon: 87.300 }, // B (Connection)
    { lat: 22.310, lon: 87.308 }  // C (Destination)
];

displayWaypointsAndPath(waypoints);

loadObstacles({ lat: 22.305, lon: 87.320 });
loadNoFlyZones({ lat: 22.305, lon: 87.320 });
