import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RouteMap from './pages/RouteMap';
import VectorTileMap from './pages/VectorTileMap';
import HybridMap from './pages/HybridMap';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/route-map" element={<RouteMap/>}/>
                <Route path="/vector-map" element={<VectorTileMap />} />
                <Route path="/hybrid-map" element={<HybridMap />} />
            </Routes>
        </Router>
    );
}

export default App;
