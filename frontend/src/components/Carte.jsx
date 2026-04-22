import React from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const iconeParDefaut = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const Carte = () => {
    // Coordonnées de Cergy
    const positionLyon = [49.039026, 2.077767];

    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #dbeafe',
            }}
        >
            <MapContainer
                center={positionLyon}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={positionLyon} icon={iconeParDefaut}></Marker>
            </MapContainer>
        </Box>
    );
};

export default Carte;
