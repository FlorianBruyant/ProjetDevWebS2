import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// 🎨 Import des icônes pour chaque type d'objet
import {
    DirectionsCar,
    Traffic,
    LocalParking,
    Warning,
    PedalBike,
    DirectionsBus,
} from '@mui/icons-material';

// --- 🛠️ LA FABRIQUE D'ICÔNES DYNAMIQUES ---
const creerIconeSmart = (item) => {
    let IconeMUI = DirectionsBus; // Icône par défaut
    let couleur = '#1a237e'; // Bleu foncé par défaut

    // 🕵️‍♂️ LOGIQUE DE DÉTECTION DU TYPE
    // 1. Détection des Vélos (si le nom contient "Station")
    if (item.nom?.toLowerCase().includes('station')) {
        IconeMUI = PedalBike;
        couleur = '#1565c0'; // Bleu Vélib
    }
    // 2. Détection des Feux (si l'objet a un état_actuel)
    else if (item.etat_actuel) {
        IconeMUI = Traffic;
        if (item.etat_actuel === 'VERT') couleur = '#4caf50';
        else if (item.etat_actuel === 'ORANGE') couleur = '#ff9800';
        else couleur = '#f44336'; // Rouge
    }
    // 3. Détection des Parkings (si l'objet a des places_totales)
    else if (item.places_totales) {
        IconeMUI = LocalParking;
        couleur = '#455a64'; // Gris ardoise
    }
    // 4. Détection des Véhicules / Voitures
    else if (item.immatriculation) {
        IconeMUI = DirectionsCar;
        couleur = '#2e7d32'; // Vert forêt
    }
    // 5. Incidents
    else if (item.type_incident) {
        IconeMUI = Warning;
        couleur = '#d32f2f'; // Rouge alerte
    }

    // Si l'objet est en panne, on le met en gris
    if (item.en_panne) couleur = '#9e9e9e';

    // Transformation du composant React en HTML pour Leaflet
    const htmlIcone = renderToStaticMarkup(
        <div
            style={{
                color: 'white',
                backgroundColor: couleur,
                borderRadius: '50%',
                padding: '6px',
                border: '2px solid white',
                display: 'flex',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
        >
            <IconeMUI style={{ fontSize: '20px' }} />
        </div>,
    );

    return L.divIcon({
        html: htmlIcone,
        className: 'smart-marker-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
};

const RecentreurDeCarte = ({ donnees }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        if (donnees && donnees.length > 0) {
            const premier = donnees[0];
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
        // 1. On cherche dans point_actuel_details (Format harmonisé)
        if (item.point_actuel_details) {
            return [
                parseFloat(item.point_actuel_details.latitude),
                parseFloat(item.point_actuel_details.longitude),
            ];
        }

        // 2. Sécurité : on cherche lat/lng en direct (Ancien format)
        if (item.lat !== undefined && item.lng !== undefined) {
            return [parseFloat(item.lat), parseFloat(item.lng)];
        }

        // 3. Si on ne trouve rien, on log l'erreur pour savoir quel objet pose problème
        console.warn('Objet sans position valide détecté :', item);
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
                            icon={creerIconeSmart(item)} // 🚀 Utilisation de l'icône dynamique
                        >
                            <Popup>
                                <Box sx={{ p: 0.5 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {item.nom}
                                    </Typography>

                                    {/* Contenu dynamique du Popup */}
                                    <Typography variant="body2">
                                        {item.nom
                                            ?.toLowerCase()
                                            .includes('station')
                                            ? `🚲 Vélos dispos: ${item.vitesse}`
                                            : item.etat_actuel
                                              ? `🚦 État: ${item.etat_actuel}`
                                              : item.places_totales
                                                ? `🅿️ Places: ${item.places_occupees}/${item.places_totales}`
                                                : item.immatriculation
                                                  ? `🚗 Vitesse: ${item.vitesse} km/h`
                                                  : null}
                                    </Typography>

                                    {item.en_panne && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                            sx={{
                                                fontWeight: 'bold',
                                                display: 'block',
                                                mt: 1,
                                            }}
                                        >
                                            ⚠️ EN MAINTENANCE
                                        </Typography>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Box>
    );
};

export default Carte;
