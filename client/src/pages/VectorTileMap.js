import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import '../css/style.css';

const VectorTileMap = () => {
    const mapRef = useRef(null);
    const [cursorCoords, setCursorCoords] = useState({ lat: 0, lon: 0 });

    useEffect(() => {
        if (!mapRef.current) {
            const mapContainer = document.getElementById('vector-map');
            if (!mapContainer) {
                console.error('Map container not found!');
                return;
            }

            // Initialize the map
            mapRef.current = L.map('vector-map', {
                center: [22.305, 87.320],
                zoom: 15,
                minZoom: 12,
                maxZoom: 18,
                zoomControl: true
            });

            // Get API key from .env
            const apiKey = process.env.REACT_APP_MAPTILER_API_KEY || "VgZOdfY3DdfXf3dO0Lgm";
            if (!apiKey) {
                console.error('API key not found. Check .env file.');
                return;
            }

            // Vector tile source
            const vectorTileUrl = `https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=${apiKey}`;
            console.log(vectorTileUrl)
            // Vector tile layer
            L.vectorGrid.protobuf(vectorTileUrl, {
                interactive: true,
                vectorTileLayerStyles: {
                    water: { fill: true, weight: 1, fillColor: '#9ecae1', color: '#6baed6' },
                    landcover: { fill: true, weight: 1, fillColor: '#c7e9c0', color: '#74c476' },
                    road: { weight: 1, color: '#f03a3a' },
                    building: { weight: 1, fillColor: '#d95f0e', color: '#d95f0e' },
                    boundary: { weight: 2, color: '#3182bd' },
                    place: { weight: 1, color: '#6baed6' },
                },
                getFeatureId: (feature) => feature.properties.id
            }).addTo(mapRef.current);

            // Update cursor coordinates
            mapRef.current.on('mousemove', (e) => {
                setCursorCoords({ lat: e.latlng.lat.toFixed(6), lon: e.latlng.lng.toFixed(6) });
            });

            // Add scale control
            L.control.scale().addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Vector Tile Map with Leaflet</h2>
            <div style={{ marginBottom: '10px' }}>
                <strong>Cursor Coordinates:</strong> Lat: {cursorCoords.lat}, Lon: {cursorCoords.lon}
            </div>
            <div
                id="vector-map"
                style={{
                    height: '600px',
                    width: '80%',
                    margin: '0 auto',
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}
            ></div>
        </div>
    );
};

export default VectorTileMap;
