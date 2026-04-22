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

// On ajoute la prop 'hauteur' qui par défaut est à 100%
const Carte = ({ hauteur = '100%' }) => {
    // Coordonnées de Cergy (Grand Centre)
    const positionCergy = [49.0351, 2.0799];

    return (
        <Box
            sx={{
                height: hauteur,
                width: '100%',
                borderRadius: 4,
                overflow: 'hidden',
            }}
        >
            <MapContainer
                center={positionCergy}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                <Marker position={positionCergy} icon={iconeParDefaut}>
                    <Popup>Cergy - Grand Centre</Popup>
                </Marker>
            </MapContainer>
        </Box>
    );
};

export default Carte;
