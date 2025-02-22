// Updated pages/MapView.js as React Component

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
    const [start, setStart] = useState('22.303,87.315');
    const [destination, setDestination] = useState('22.310,87.325');

    useEffect(() => {
        const map = L.map('map').setView([22.303, 87.315], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        return () => {
            map.remove();
        };
    }, []);

    const handleConfirm = () => {
        const startCoords = start.split(',').map(Number);
        const destinationCoords = destination.split(',').map(Number);

        if (startCoords.length === 2 && destinationCoords.length === 2 &&
            !isNaN(startCoords[0]) && !isNaN(startCoords[1]) &&
            !isNaN(destinationCoords[0]) && !isNaN(destinationCoords[1])) {
            loadMap(startCoords, destinationCoords);
        } else {
            alert("Please enter valid coordinates in 'latitude,longitude' format.");
        }
    };

    const loadMap = (startCoords, destinationCoords) => {
        const map = L.map('map').setView(startCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker(startCoords).addTo(map).bindPopup('Start Point').openPopup();
        L.marker(destinationCoords).addTo(map).bindPopup('Destination Point');

        L.polyline([startCoords, destinationCoords], { color: 'blue', weight: 4 }).addTo(map);

        loadObstacles(map);
        loadNoFlyZones(map);
    };

    const loadObstacles = async (map) => {
        const response = await fetch('/api/obstacles');
        const obstacles = await response.json();
        obstacles.forEach(obs => {
            L.circle([obs.lat, obs.lon], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: obs.radius
            }).addTo(map).bindPopup(`Obstacle: ${obs.name}`);
        });
    };

    const loadNoFlyZones = async (map) => {
        const response = await fetch('/api/no-fly-zones');
        const zones = await response.json();
        zones.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                color: 'orange',
                fillColor: '#ffa500',
                fillOpacity: 0.3,
                radius: zone.radius
            }).addTo(map).bindPopup(`No-Fly Zone: ${zone.name}`);
        });
    };

    return (
        <div>
            <div>
                <label>Start (lat, lon):</label>
                <input type="text" value={start} onChange={(e) => setStart(e.target.value)} placeholder="22.303,87.315" />
                <label>Destination (lat, lon):</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="22.310,87.325" />
                <button onClick={handleConfirm}>Confirm</button>
            </div>
            <div id="map" style={{ height: '600px', width: '100%', marginTop: '10px' }}></div>
        </div>
    );
}

export default MapView;
