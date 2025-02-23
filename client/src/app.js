import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RouteMap from './pages/RouteMap';
import VectorTileMap from './pages/VectorTileMap';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/route-map" element={<RouteMap/>}/>
                <Route path="/vector-map" element={<VectorTileMap />} />
            </Routes>
        </Router>
    );
}

export default App;
