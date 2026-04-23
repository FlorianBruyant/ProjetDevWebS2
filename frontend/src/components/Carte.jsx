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

// Petit composant pour forcer le redimensionnement et le centrage
const RecentreurDeCarte = ({ donnees }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        // Optionnel : Si tu veux que la carte se déplace vers le premier résultat trouvé
        if (donnees && donnees.length > 0) {
            const premier = donnees[0];
            const lat =
                premier.point_actuel?.latitude || premier.position?.latitude;
            const lng =
                premier.point_actuel?.longitude || premier.position?.longitude;
            if (lat && lng) map.panTo([lat, lng]);
        }
    }, [donnees, map]);
    return null;
};

const Carte = ({ hauteur = '100%', donnees = [] }) => {
    const positionCergy = [49.0351, 2.0799];

    // Fonction pour extraire la position selon le modèle (Vehicule vs Parking/Incident)
    const extrairePosition = (item) => {
        const lat = item.point_actuel?.latitude || item.position?.latitude;
        const lng = item.point_actuel?.longitude || item.position?.longitude;

        if (lat !== undefined && lng !== undefined) {
            return [lat, lng];
        }
        return null;
    };

    return (
        <Box
            sx={{
                height: hauteur,
                width: '100%',
                borderRadius: 0,
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

                <RecentreurDeCarte donnees={donnees} />

                {/* Affichage des marqueurs dynamiques */}
                {donnees.map((item) => {
                    const pos = extrairePosition(item);
                    if (!pos) return null; // Sécurité si pas de coordonnées

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
                                    `Immat: ${item.immatriculation}`}
                                <br />
                                {item.etat_actuel &&
                                    `État: ${item.etat_actuel}`}
                                <br />
                                {item.places_totales &&
                                    `Places: ${item.places_occupees}/${item.places_totales}`}
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Garder le marqueur de Cergy par défaut si la liste est vide */}
                {donnees.length === 0 && (
                    <Marker position={positionCergy} icon={iconeParDefaut}>
                        <Popup>Cergy - Grand Centre</Popup>
                    </Marker>
                )}
            </MapContainer>
        </Box>
    );
};

export default Carte;
