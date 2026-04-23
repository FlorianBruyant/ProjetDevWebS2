import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

const RecentreurDeCarte = ({ donnees }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        if (donnees && donnees.length > 0) {
            const premier = donnees[0];
            // 🚨 CORRECTION : On utilise point_actuel_details
            const lat =
                premier.point_actuel_details?.latitude ||
                premier.position?.latitude;
            const lng =
                premier.point_actuel_details?.longitude ||
                premier.position?.longitude;
            if (lat && lng) map.panTo([lat, lng]);
        }
    }, [donnees, map]);
    return null;
};

const Carte = ({ hauteur = '100%', donnees = [] }) => {
    const positionCergy = [49.0351, 2.0799];

    const extrairePosition = (item) => {
        // 🚨 CORRECTION : On utilise point_actuel_details pour les véhicules
        const lat =
            item.point_actuel_details?.latitude || item.position?.latitude;
        const lng =
            item.point_actuel_details?.longitude || item.position?.longitude;

        if (lat !== undefined && lng !== undefined) {
            return [lat, lng];
        }
        return null;
    };

    return (
        <Box sx={{ height: hauteur, width: '100%', overflow: 'hidden' }}>
            <MapContainer
                center={positionCergy}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecentreurDeCarte donnees={donnees} />

                {donnees.map((item) => {
                    const pos = extrairePosition(item);
                    if (!pos) return null;

                    return (
                        <Marker
                            key={`${item.id}-${item.nom}`}
                            position={pos}
                            icon={iconeParDefaut}
                        >
                            <Popup>
                                <strong>{item.nom}</strong>
                                <br />
                                {item.immatriculation &&
                                    `ID: ${item.immatriculation}`}
                                <br />
                                {item.vitesse !== undefined &&
                                    `Vélos: ${item.vitesse}`}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Box>
    );
};

export default Carte;
