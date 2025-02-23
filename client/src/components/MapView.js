import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchObstacles, fetchNoFlyZones, fetchAlerts,fetchAnnotations } from '../services/Api';
import '../css/style.css';
// import AnnotationIcon from '../icons/annotationIcon';
const MapView = () => {
    const [start, setStart] = useState('22.303,87.315');
    const [destination, setDestination] = useState('22.310,87.325');
    const [selectedOption, setSelectedOption] = useState('All');
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([22.305, 87.320], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const handleConfirm = async () => {
        const startCoords = start.split(',').map(Number);
        const destinationCoords = destination.split(',').map(Number);

        if (validateCoordinates(startCoords) && validateCoordinates(destinationCoords)) {
            plotRoute(startCoords, destinationCoords);
        } else {
            alert("Please enter valid coordinates in 'latitude,longitude' format.");
        }
    };

    const validateCoordinates = (coords) => {
        return coords.length === 2 && coords.every(coord => !isNaN(coord));
    };

    const plotRoute = async (startCoords, destinationCoords) => {
        const map = mapRef.current;
        if (!map) return;

        map.eachLayer(layer => {
            if (!layer._url) map.removeLayer(layer);
        });

        // L.marker(startCoords).addTo(map).bindPopup('Start Point').openPopup();
        // L.marker(destinationCoords).addTo(map).bindPopup('Destination Point');
        // L.polyline([startCoords, destinationCoords], { color: 'blue', weight: 4 }).addTo(map);

        switch (selectedOption) {
            case 'Obstacles':
                await loadObstacles();
                break;
            case 'No-Fly Zones':
                await loadNoFlyZones();
                break;
            case 'Alerts':
                await loadAlerts();
                break;
            case 'Annotations':
                await loadAnnotations();
                break;
            case 'All':
                await loadAll();
                break;
            default:
                break;
        }
    };

    const loadObstacles = async () => {
        const map = mapRef.current;
        const obstacles = await fetchObstacles();
        obstacles.forEach(obs => {
            L.circle([obs.lat, obs.lon], {
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: obs.radius * 10
            }).addTo(map).bindPopup(`Obstacle: ${obs.name}`);
        });
    };

    const loadNoFlyZones = async () => {
        const map = mapRef.current;
        const zones = await fetchNoFlyZones();
        zones.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                color: 'orange',
                fillColor: '#ffa500',
                fillOpacity: 0.3,
                radius: zone.radius * 10
            }).addTo(map).bindPopup(`No-Fly Zone: ${zone.name}`);
        });
    };

    const loadAlerts = async () => {
        const map = mapRef.current;
        try {
            const alerts = await fetchAlerts();
            alerts.forEach(alert => {
                const alertIcon = L.divIcon({
                    className: 'custom-alert-icon',
                    html: `<div style="display: flex; align-items: center; justify-content: center;">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_4236_33043)">
                                        <path d="M18.2689 19.4759H1.73102C1.10651 19.4759 0.54667 19.1533 0.233494 18.613C-0.0732733 18.0836 -0.0779628 17.4593 0.220598 16.8999L8.48963 1.41025C8.78573 0.855566 9.35037 0.524414 9.99998 0.524414C10.6496 0.524414 11.2142 0.855566 11.5104 1.41025L19.7794 16.8999C20.078 17.4592 20.0733 18.0837 19.7665 18.613C19.4533 19.1533 18.8935 19.4759 18.2689 19.4759Z" fill="#F03A3A"/>
                                        <path d="M10.0006 16.9362C9.13873 16.9362 8.4375 16.235 8.4375 15.3731C8.4375 14.5112 9.13873 13.81 10.0006 13.81C10.8626 13.81 11.5638 14.5112 11.5638 15.3731C11.5638 16.235 10.8626 16.9362 10.0006 16.9362ZM10.0007 12.2468C9.13873 12.2468 8.4375 11.5456 8.4375 10.6837V7.30338C8.4375 6.44146 9.13873 5.74023 10.0006 5.74023C10.8626 5.74023 11.5638 6.44146 11.5638 7.30338V10.6837C11.5638 11.5456 10.8626 12.2468 10.0007 12.2468Z" fill="#FFF3F3"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_4236_33043">
                                            <rect width="20" height="20" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                });

                L.marker([alert.lat, alert.lon], { icon: alertIcon }).addTo(map).bindPopup(`Alert: ${alert.name}`);
            });
        } catch (error) {
            console.error("Failed to load alerts:", error);
        }
    };

    const loadAnnotations = async () => {
        const map = mapRef.current;
        try {
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
                        </div>
                    `,
                    iconSize: [20, 30],
                    iconAnchor: [10, 30]
                });
    
                L.marker([annotation.lat, annotation.lon], { icon: annotationIcon })
                    .addTo(map)
                    .bindPopup(`Annotation: ${annotation.name}`);
            });
        } catch (error) {
            console.error("Failed to load annotations:", error);
        }
    };
    

    const loadAll = async () => {
        await loadObstacles();
        await loadNoFlyZones();
        await loadAlerts();
        await loadAnnotations();
    };

    return (
        <div>
            <div className="input-container">
                <label>Start (lat, lon):</label>
                <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="22.303,87.315"
                />

                <label>Destination (lat, lon):</label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="22.310,87.325"
                />

                <label>View:</label>
                <select
                    className="dropdown"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    <option value="Obstacles">Obstacles</option>
                    <option value="No-Fly Zones">No-Fly Zones</option>
                    <option value="Alerts">Alerts</option>
                    <option value="Annotations">Annotations</option>
                    <option value="All">All</option>
                </select>

                <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
            </div>

            <div id="map" style={{ height: '600px', width: '100%', marginTop: '10px' }}></div>
        </div>
    );
};

export default MapView;
