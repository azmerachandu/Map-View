
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl';
import 'mapbox-gl-leaflet';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchObstacles, fetchNoFlyZones, fetchAlerts, fetchAnnotations } from '../services/Api';
import '../css/style.css';

const MapboxVectorTileMap = () => {
    const mapRef = useRef(null);
    const markersLayer = useRef(null);
    const pathLayer = useRef(null);
    const obstacleLayer = useRef(null);
    const nfzLayer = useRef(null);
    const alertLayer = useRef(null);
    const annotationLayer = useRef(null);
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

            // Layer groups
            markersLayer.current = L.layerGroup().addTo(mapRef.current);
            pathLayer.current = L.layerGroup().addTo(mapRef.current);
            obstacleLayer.current = L.layerGroup().addTo(mapRef.current);
            nfzLayer.current = L.layerGroup().addTo(mapRef.current);
            alertLayer.current = L.layerGroup().addTo(mapRef.current);
            annotationLayer.current = L.layerGroup().addTo(mapRef.current);

            plotWaypointsAndPath();
            loadAllLayers();

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

    const plotWaypointsAndPath = () => {
        if (!mapRef.current) return;

        const waypoints = [
            { name: 'A', lat: 22.305864, lon: 87.315976 },
            { name: 'B', lat: 22.306, lon: 87.320 },
            { name: 'C', lat: 22.311242, lon: 87.319623 }
        ];

        markersLayer.current.clearLayers();
        pathLayer.current.clearLayers();

        // Add waypoints
        waypoints.forEach((point) => {
            L.marker([point.lat, point.lon], {
                icon: L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div style='background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 50%; font-weight: bold;'>${point.name}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(markersLayer.current);
        });

        // Draw route A → B → C
        L.polyline(waypoints.map(wp => [wp.lat, wp.lon]), { color: 'green', weight: 3, dashArray: '5,5' }).addTo(pathLayer.current);

        // Add directional arrows
        createDirectionArrow(waypoints[0], waypoints[1]);
        createDirectionArrow(waypoints[1], waypoints[2]);

        // Direct A → C path
        L.polyline([[waypoints[0].lat, waypoints[0].lon], [waypoints[2].lat, waypoints[2].lon]], { color: 'blue', weight: 3, dashArray: '5,5' }).addTo(pathLayer.current);
    };

    const createDirectionArrow = (start, end) => {
        const deltaX = end.lon - start.lon;
        const deltaY = end.lat - start.lat;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        const updateArrowSize = () => {
            const currentZoom = mapRef.current.getZoom();
            const maxZoom = 16;
            const minZoom = 12;
            const baseSize = 120;

            const size = baseSize * ((currentZoom - minZoom) / (maxZoom - minZoom));
            return Math.max(40, size);
        };


        const createArrow = (size) => L.divIcon({
            className: 'direction-arrow',
            html: `
                <div style="transform: rotate(${angle}deg);">
                    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.0898 41.3548L23.1738 17.2959L40.7421 27.8208L25.0898 41.3548Z" fill="#E23744"/>
                    </svg>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });

        const arrowSize = updateArrowSize();
        const arrowMarker = L.marker([(start.lat + end.lat) / 2, (start.lon + end.lon) / 2], {
            icon: createArrow(arrowSize)
        }).addTo(pathLayer.current);

        mapRef.current.on('zoomend', () => {
            const newSize = updateArrowSize();
            arrowMarker.setIcon(createArrow(newSize));
        });
    };

    const loadAllLayers = async () => {
        await loadObstacles();
        await loadNoFlyZones();
        await loadAlerts();
        await loadAnnotations();
    };

    const loadObstacles = async () => {
        const obstacles = await fetchObstacles();
        obstacles.forEach(obs => {
            L.circle([obs.lat, obs.lon], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3,
                radius: obs.radius * 10
            }).addTo(obstacleLayer.current);
        });
    };

    const loadNoFlyZones = async () => {
        const zones = await fetchNoFlyZones();
        zones.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                color: 'orange',
                fillColor: '#ffa500',
                fillOpacity: 0.3,
                radius: zone.radius * 10
            }).addTo(nfzLayer.current);
        });
    };

    const loadAlerts = async () => {
        const alerts = await fetchAlerts();
        alerts.forEach(alert => {
            const alertIcon = L.divIcon({
                className: 'custom-alert-icon',
                html: `
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.2689 19.4759H1.73102C1.10651 19.4759 0.54667 19.1533 0.233494 18.613C-0.0732733 18.0836 -0.0779628 17.4593 0.220598 16.8999L8.48963 1.41025C8.78573 0.855566 9.35037 0.524414 9.99998 0.524414C10.6496 0.524414 11.2142 0.855566 11.5104 1.41025L19.7794 16.8999C20.078 17.4592 20.0733 18.0837 19.7665 18.613C19.4533 19.1533 18.8935 19.4759 18.2689 19.4759Z" fill="#F03A3A"/>
                            <path d="M10.0006 16.9362C9.13873 16.9362 8.4375 16.235 8.4375 15.3731C8.4375 14.5112 9.13873 13.81 10.0006 13.81C10.8626 13.81 11.5638 14.5112 11.5638 15.3731C11.5638 16.235 10.8626 16.9362 10.0006 16.9362ZM10.0007 12.2468C9.13873 12.2468 8.4375 11.5456 8.4375 10.6837V7.30338C8.4375 6.44146 9.13873 5.74023 10.0006 5.74023C10.8626 5.74023 11.5638 6.44146 11.5638 7.30338V10.6837C11.5638 11.5456 10.8626 12.2468 10.0007 12.2468Z" fill="#FFF3F3"/>
                        </svg>
                    </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            L.marker([alert.lat, alert.lon], { icon: alertIcon }).addTo(alertLayer.current);
        });
    };

    const loadAnnotations = async () => {
        const annotations = await fetchAnnotations();
        annotations.forEach(annotation => {
            const annotationIcon = L.divIcon({
                className: 'custom-annotation-icon',
                html: `
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.83311 10.2808L5.22949 10.9159V18.7124C5.22948 19.1248 5.35319 19.5277 5.58462 19.869C5.70309 20.0437 5.96313 20.0437 6.08164 19.869C6.31308 19.5277 6.43679 19.1248 6.43678 18.7124V10.9159L5.83311 10.2808Z" fill="#676767"/>
                            <path d="M5.22949 8.53125V10.9159C5.42808 10.9355 5.62941 10.9159 5.83311 10.9159C6.03682 10.9159 6.23814 10.9355 6.43674 10.9159V8.53125H5.22949Z" fill="#676767"/>
                            <path d="M5.83301 0V9.73843C8.52218 9.73843 10.7022 7.55839 10.7022 4.86922C10.7022 2.18004 8.52218 0 5.83301 0Z" fill="#CC3245"/>
                            <path d="M9.49505 4.86922C9.49505 2.18004 7.85554 0 5.83308 0C3.14391 0 0.963867 2.18004 0.963867 4.86922C0.963867 7.55839 3.14391 9.73843 5.83308 9.73843C7.85554 9.73843 9.49505 7.55839 9.49505 4.86922Z" fill="#FF3E3A"/>
                        </svg>
                    </div>`,
                iconSize: [20, 30],
                iconAnchor: [10, 30]
            });

            L.marker([annotation.lat, annotation.lon], { icon: annotationIcon }).addTo(annotationLayer.current);
        });
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Mapbox Vector Tile Map with Waypoints, Obstacles, and NFZ</h2>
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
