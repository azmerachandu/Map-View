// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'mapbox-gl';
// import 'mapbox-gl-leaflet';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import '../css/style.css';

// const alerts = [
//     { id: 1, name: 'Alert 1', lat: 22.305, lon: 87.320 },
//     { id: 2, name: 'Alert 2', lat: 22.310, lon: 87.325 },
//     { id: 3, name: 'Alert 3', lat: 22.300, lon: 87.315 }
// ];

// const HybridMap = () => {
//     const mapRef = useRef(null);
//     const alertMarkers = useRef([]);
//     const [useMapbox, setUseMapbox] = useState(false);
//     const [currentAlert, setCurrentAlert] = useState(null);
//     const mapboxToken =process.env.REACT_APP_MAPBOX_API_KEY || "pk.eyJ1IjoiYnVsYnVsZGVsaXZlcnkiLCJhIjoiY203aHdmb3lxMDl5ZzJscjI4MmU2eXYzNSJ9.XDNjZ6LVcGuiYkSZ1VYd4A";

//     useEffect(() => {
//         if (!mapRef.current) {
//             mapRef.current = L.map('hybrid-map', {
//                 center: [22.305, 87.320],
//                 zoom: 9,
//                 minZoom: 5,
//                 maxZoom: 19,
//                 zoomControl: true
//             });

//             loadRasterTiles();
//             plotAlertMarkers();
//             L.control.scale().addTo(mapRef.current);
//         }

//         return () => {
//             if (mapRef.current) {
//                 mapRef.current.remove();
//                 mapRef.current = null;
//             }
//         };
//     }, []);

//     // 🌍 Load Leaflet Raster Tiles (OpenStreetMap)
//     const loadRasterTiles = () => {
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; OpenStreetMap contributors'
//         }).addTo(mapRef.current);
//     };

//     // 🚨 Plot Alert Markers
//     const plotAlertMarkers = () => {
//         alerts.forEach(alert => {
//             const marker = L.marker([alert.lat, alert.lon], {
//                 icon: L.divIcon({
//                     className: 'custom-alert-icon',
//                     html: `
//                         <div style="display: flex; align-items: center; justify-content: center;">
//                             <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M18.2689 19.4759H1.73102C1.10651 19.4759 0.54667 19.1533 0.233494 18.613C-0.0732733 18.0836 -0.0779628 17.4593 0.220598 16.8999L8.48963 1.41025C8.78573 0.855566 9.35037 0.524414 9.99998 0.524414C10.6496 0.524414 11.2142 0.855566 11.5104 1.41025L19.7794 16.8999C20.078 17.4592 20.0733 18.0837 19.7665 18.613C19.4533 19.1533 18.8935 19.4759 18.2689 19.4759Z" fill="#F03A3A"/>
//                                 <path d="M10.0006 16.9362C9.13873 16.9362 8.4375 16.235 8.4375 15.3731C8.4375 14.5112 9.13873 13.81 10.0006 13.81C10.8626 13.81 11.5638 14.5112 11.5638 15.3731C11.5638 16.235 10.8626 16.9362 10.0006 16.9362ZM10.0007 12.2468C9.13873 12.2468 8.4375 11.5456 8.4375 10.6837V7.30338C8.4375 6.44146 9.13873 5.74023 10.0006 5.74023C10.8626 5.74023 11.5638 6.44146 11.5638 7.30338V10.6837C11.5638 11.5456 10.8626 12.2468 10.0007 12.2468Z" fill="#FFF3F3"/>
//                             </svg>
//                         </div>`,
//                     iconSize: [30, 30],
//                     iconAnchor: [15, 30]
//                 })
//             }).addTo(mapRef.current);

//             marker.on('click', () => handleAlertClick(alert));
//             alertMarkers.current.push(marker);
//         });
//     };

//     // ⚙️ Handle Alert Click (Switch to Vector)
//     const handleAlertClick = (alert) => {
//         const userConfirmed = window.confirm(
//             `Switch to vector tiles for the alert at ${alert.name}?`
//         );

//         if (userConfirmed) {
//             setCurrentAlert(alert);
//             switchToMapboxVectorTile(alert);
//         }
//     };

//     // 🌐 Switch to Mapbox Vector Tiles (Detailed)
//     const switchToMapboxVectorTile = (alert) => {
//         if (!mapboxToken) {
//             console.error('Mapbox token is missing.');
//             return;
//         }

//         setUseMapbox(true);

//         // Remove existing non-tile layers
//         mapRef.current.eachLayer((layer) => {
//             if (!(layer instanceof L.TileLayer)) {
//                 mapRef.current.removeLayer(layer);
//             }
//         });

//         // 🔑 Use Detailed Style for Buildings
//         L.mapboxGL({
//             accessToken: mapboxToken,
//             style: 'mapbox://styles/mapbox/outdoors-v11' // 🌟 Change style here for 3D buildings
//         }).addTo(mapRef.current);

//         const bounds = L.latLngBounds(
//             L.latLng(alert.lat - 0.01, alert.lon - 0.01),
//             L.latLng(alert.lat + 0.01, alert.lon + 0.01)
//         );

//         mapRef.current.setView([alert.lat, alert.lon], 17);
//         mapRef.current.setMaxBounds(bounds);
//         mapRef.current.setMinZoom(17);
//         mapRef.current.setMaxZoom(22);
//     };


// const resetToRasterTiles = () => {
//     if (!mapRef.current) return;

//     setUseMapbox(false);

//     // Clear non-tile layers
//     mapRef.current.eachLayer((layer) => {
//         if (!(layer instanceof L.TileLayer)) {
//             mapRef.current.removeLayer(layer);
//         }
//     });

//     // 🟢 Load Raster Tiles
//     loadRasterTiles();

//     // 🔔 Re-plot Alert Markers
//     plotAlertMarkers();

//     // 🕹 Re-enable Map Interactions
//     mapRef.current.dragging.enable();
//     mapRef.current.scrollWheelZoom.enable();
//     mapRef.current.doubleClickZoom.enable();

//     // ✅ Ensure Zoom Control is Enabled
//     if (!mapRef.current.zoomControl) {
//         mapRef.current.zoomControl = L.control.zoom({ position: 'topright' });
//         mapRef.current.zoomControl.addTo(mapRef.current);
//     }

//     // 🗺 Reset Zoom and Center to Default
//     mapRef.current.setView([22.305, 87.320], 9);

//     // 🚫 Remove any Vector-based Bounds
//     mapRef.current.setMaxBounds(null);
//     mapRef.current.setMinZoom(5);
//     mapRef.current.setMaxZoom(19);
// };


//     return (
//         <div style={{ textAlign: 'center', marginTop: '20px' }}>
//             <h2>Hybrid Map (Leaflet + Mapbox on Alert)</h2>
//             {currentAlert && useMapbox && (
//                 <div style={{ marginBottom: '10px', color: '#E23744' }}>
//                     Viewing alert: <strong>{currentAlert.name}</strong> in Vector mode.
//                     <button onClick={resetToRasterTiles} style={{ marginLeft: '10px' }}>
//                         🔄 Reset to Raster Map
//                     </button>
//                 </div>
//             )}
//             <div
//                 id="hybrid-map"
//                 style={{
//                     height: '600px',
//                     width: '80%',
//                     margin: '0 auto',
//                     border: '1px solid #ccc',
//                     borderRadius: '10px',
//                     boxShadow: '0 0 10px rgba(0,0,0,0.2)'
//                 }}
//             ></div>
//         </div>
//     );
// };

// export default HybridMap;




import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl';
import 'mapbox-gl-leaflet';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchObstacles, fetchNoFlyZones, fetchAlerts, fetchAnnotations } from '../services/Api';
import '../css/style.css';

const HybridMap = () => {
    const mapRef = useRef(null);
    const [useMapbox, setUseMapbox] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(null);
    const mapboxToken = process.env.REACT_APP_MAPBOX_API_KEY || "pk.eyJ1IjoiYnVsYnVsZGVsaXZlcnkiLCJhIjoiY203aHdmb3lxMDl5ZzJscjI4MmU2eXYzNSJ9.XDNjZ6LVcGuiYkSZ1VYd4A";

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('hybrid-map', {
                center: [22.305, 87.320],
                zoom: 9,
                minZoom: 5,
                maxZoom: 19,
                zoomControl: true
            });

            loadRasterTiles();
            fetchAllData();
            L.control.scale().addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // 🌍 Load Leaflet Raster Tiles (OpenStreetMap)
    const loadRasterTiles = () => {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
    };

    // 📡 Fetch all data from APIs
    const fetchAllData = async () => {
        await loadObstacles();
        await loadNoFlyZones();
        await loadAlerts();
        await loadAnnotations();
    };

    // 🚨 Load Alerts
    const loadAlerts = async () => {
        const alerts = await fetchAlerts();
    
        alerts.forEach(alert => {
            const alertSvg = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2689 19.4759H1.73102C1.10651 19.4759 0.54667 19.1533 0.233494 18.613C-0.0732733 18.0836 -0.0779628 17.4593 0.220598 16.8999L8.48963 1.41025C8.78573 0.855566 9.35037 0.524414 9.99998 0.524414C10.6496 0.524414 11.2142 0.855566 11.5104 1.41025L19.7794 16.8999C20.078 17.4592 20.0733 18.0837 19.7665 18.613C19.4533 19.1533 18.8935 19.4759 18.2689 19.4759Z" fill="#F03A3A"/>
                    <path d="M10.0006 16.9362C9.13873 16.9362 8.4375 16.235 8.4375 15.3731C8.4375 14.5112 9.13873 13.81 10.0006 13.81C10.8626 13.81 11.5638 14.5112 11.5638 15.3731C11.5638 16.235 10.8626 16.9362 10.0006 16.9362ZM10.0007 12.2468C9.13873 12.2468 8.4375 11.5456 8.4375 10.6837V7.30338C8.4375 6.44146 9.13873 5.74023 10.0006 5.74023C10.8626 5.74023 11.5638 6.44146 11.5638 7.30338V10.6837C11.5638 11.5456 10.8626 12.2468 10.0007 12.2468Z" fill="#FFF3F3"/>
                </svg>
            `;
    
            const marker = L.marker([alert.lat, alert.lon], {
                icon: createCustomIcon(alertSvg, 30)
            }).addTo(mapRef.current);
    
            marker.on('mouseover', () => showTooltip(marker, `🚨 Alert No: ${alert.id}`));
            marker.on('click', () => confirmSwitch(alert, 'alert'));
        });
    };
    
    // 🏗 Load Obstacles
    const loadObstacles = async () => {
        const obstacles = await fetchObstacles();
        obstacles.forEach(obs => {
            const marker = L.circle([obs.lat, obs.lon], {
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.3,
                radius: obs.radius * 10
            }).addTo(mapRef.current);

            marker.on('mouseover', () => showTooltip(marker, `⛔ Obstacle: ${obs.name}`));
            marker.on('click', () => confirmSwitch(obs, 'obstacle'));
        });
    };

    // 🚫 Load No-Fly Zones
    const loadNoFlyZones = async () => {
        const zones = await fetchNoFlyZones();
        zones.forEach(zone => {
            const marker = L.circle([zone.lat, zone.lon], {
                color: 'orange',
                fillColor: '#ffa500',
                fillOpacity: 0.3,
                radius: zone.radius * 10
            }).addTo(mapRef.current);

            marker.on('mouseover', () => showTooltip(marker, `🚫 No-Fly Zone: ${zone.name}`));
            marker.on('click', () => confirmSwitch(zone, 'nfz'));
        });
    };

    // ✍ Load Annotations
    const loadAnnotations = async () => {
        const annotations = await fetchAnnotations();
        annotations.forEach(annotation => {
            const marker = L.marker([annotation.lat, annotation.lon], {
                icon: createCustomIcon('', '📍'),
                title: `Annotation ${annotation.id}`
            }).addTo(mapRef.current);

            marker.on('mouseover', () => showTooltip(marker, `📝 Annotation: ${annotation.name}`));
            marker.on('click', () => confirmSwitch(annotation, 'annotation'));
        });
    };

    // 🎨 Create Custom SVG Icons
    const createCustomIcon = (svgCode, size = 30) => {
        return L.divIcon({
            className: 'custom-alert-icon',
            html: `
                <div style="display: flex; align-items: center; justify-content: center; width:${size}px; height:${size}px;">
                    ${svgCode}
                </div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    };
    

    // 🔔 Show Tooltip on Hover
    const showTooltip = (marker, text) => {
        marker.bindTooltip(text, { permanent: false, direction: 'top' }).openTooltip();
    };

    // ⚠ Confirm Switching to Vector
    const confirmSwitch = (feature, type) => {
        setCurrentFeature({ feature, type });
        const userConfirmed = window.confirm(
            `View ${type} in **detailed Vector Tile Mode**?`
        );

        if (userConfirmed) {
            switchToVectorTiles(feature);
        }
    };

    // 🌐 Switch to Vector Tiles
    const switchToVectorTiles = (feature) => {
        if (!mapboxToken) {
            console.error('Mapbox token is missing.');
            return;
        }

        setUseMapbox(true);

        // Remove existing non-tile layers
        mapRef.current.eachLayer((layer) => {
            if (!(layer instanceof L.TileLayer)) {
                mapRef.current.removeLayer(layer);
            }
        });

        // Add Mapbox GL Layer
        L.mapboxGL({
            accessToken: mapboxToken,
            style: 'mapbox://styles/mapbox/outdoors-v11'
        }).addTo(mapRef.current);

        // Set Bounds
        const bounds = L.latLngBounds(
            L.latLng(feature.lat - 0.01, feature.lon - 0.01),
            L.latLng(feature.lat + 0.01, feature.lon + 0.01)
        );

        mapRef.current.setView([feature.lat, feature.lon], 17);
        mapRef.current.setMaxBounds(bounds);
        mapRef.current.setMinZoom(7);
        mapRef.current.setMaxZoom(22);

        // ✅ Re-load data to display in vector mode
        fetchAllData();
    };

    // 🔄 Reset to Raster Tiles
    const resetToRasterTiles = () => {
        if (!mapRef.current) return;

        setUseMapbox(false);

        mapRef.current.eachLayer((layer) => {
            if (!(layer instanceof L.TileLayer)) {
                mapRef.current.removeLayer(layer);
            }
        });

        loadRasterTiles();
        fetchAllData(); // ✅ Re-fetch all data when switching back

        // 🕹 Enable Map Interactions
        mapRef.current.dragging.enable();
        mapRef.current.scrollWheelZoom.enable();
        mapRef.current.doubleClickZoom.enable();

        // ✅ Ensure Zoom Control is Enabled
        if (!mapRef.current.zoomControl) {
            mapRef.current.zoomControl = L.control.zoom({ position: 'topright' });
            mapRef.current.zoomControl.addTo(mapRef.current);
        }

        // 🗺 Reset Zoom and Center
        mapRef.current.setView([22.305, 87.320], 9);
        mapRef.current.setMaxBounds(null);
        mapRef.current.setMinZoom(5);
        mapRef.current.setMaxZoom(19);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Hybrid Map (Leaflet + Mapbox on Click)</h2>
            {currentFeature && useMapbox && (
                <div style={{ marginBottom: '10px', color: '#E23744' }}>
                    Viewing {currentFeature.type}: <strong>{currentFeature.feature.name || currentFeature.feature.id}</strong> in **Vector Mode**.
                    <button onClick={resetToRasterTiles} style={{ marginLeft: '10px' }}>
                        🔄 Reset to Raster Map
                    </button>
                </div>
            )}
            <div id="hybrid-map" style={{ height: '600px', width: '80%', margin: '0 auto' }}></div>
        </div>
    );
};

export default HybridMap;
