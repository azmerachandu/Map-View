import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl';
import 'mapbox-gl-leaflet';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../css/style.css';
const MapboxVectorTileMap = () => {
    const mapRef = useRef(null);
    const [cursorCoords, setCursorCoords] = useState({ lat: 0, lon: 0 });

    useEffect(() => {
        if (!mapRef.current) {
            const mapContainer = document.getElementById('mapbox-vector-map');
            if (!mapContainer) {
                console.error('Map container not found!');
                return;
            }

            const mapboxAccessToken = process.env.REACT_APP_MAPBOX_API_KEY || "pk.eyJ1IjoiYnVsYnVsZGVsaXZlcnkiLCJhIjoiY203aHdmb3lxMDl5ZzJscjI4MmU2eXYzNSJ9.XDNjZ6LVcGuiYkSZ1VYd4A";

            // Initialize Map
            mapRef.current = L.map('mapbox-vector-map', {
                center: [22.305, 87.320],
                zoom: 15,
                minZoom: 12,
                maxZoom: 22,
                zoomControl: true
            });

            // Add Mapbox vector tiles
            L.mapboxGL({
                accessToken: mapboxAccessToken,
                style: 'mapbox://styles/mapbox/streets-v11'
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
            <h2>Mapbox Vector Tile Map with Leaflet</h2>
            <div style={{ marginBottom: '10px' }}>
                <strong>Cursor Coordinates:</strong> Lat: {cursorCoords.lat}, Lon: {cursorCoords.lon}
            </div>
            <div
                id="mapbox-vector-map"
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

export default MapboxVectorTileMap;
