import React, { useEffect } from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// 🎨 Import des icônes
import {
    DirectionsCar,
    Traffic,
    LocalParking,
    Warning,
    PedalBike,
    DirectionsBus,
    CheckCircle,
    Error as ErrorIcon,
} from '@mui/icons-material';

// --- 🛠️ LA FABRIQUE D'ICÔNES DYNAMIQUES ---
const creerIconeSmart = (item) => {
    let IconeMUI = DirectionsBus;
    let couleur = '#1a237e';

    if (item.nom?.toLowerCase().includes('station')) {
        IconeMUI = PedalBike;
        couleur = '#1565c0';
    } else if (item.etat_actuel) {
        IconeMUI = Traffic;
        if (item.etat_actuel === 'VERT') couleur = '#4caf50';
        else if (item.etat_actuel === 'ORANGE') couleur = '#ff9800';
        else couleur = '#f44336';
    } else if (item.places_totales) {
        IconeMUI = LocalParking;
        couleur = '#455a64';
    } else if (item.immatriculation) {
        IconeMUI = DirectionsCar;
        couleur = '#2e7d32';
    } else if (item.type_incident) {
        IconeMUI = Warning;
        couleur = '#d32f2f';
    }

    // Si l'objet est en panne, l'icône sur la carte devient grise
    if (item.en_panne) couleur = '#9e9e9e';

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
        if (item.point_actuel_details)
            return [
                parseFloat(item.point_actuel_details.latitude),
                parseFloat(item.point_actuel_details.longitude),
            ];
        if (item.position)
            return [
                parseFloat(item.position.latitude),
                parseFloat(item.position.longitude),
            ];
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

                    const couleurFeu =
                        item.etat_actuel === 'VERT'
                            ? '#4caf50'
                            : item.etat_actuel === 'ROUGE'
                              ? '#f44336'
                              : '#ff9800';

                    return (
                        <Marker
                            key={`${item.id}-${item.nom}`}
                            position={pos}
                            icon={creerIconeSmart(item)}
                        >
                            <Popup>
                                <Box
                                    sx={{
                                        p: 1,
                                        textAlign: 'center',
                                        minWidth: '180px',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    >
                                        {item.nom}
                                    </Typography>

                                    {/* --- INDICATEUR DE SANTÉ --- */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mb: 1,
                                        }}
                                    >
                                        {item.en_panne ? (
                                            <Chip
                                                label="PANNE"
                                                size="small"
                                                color="error"
                                                icon={<ErrorIcon />}
                                                sx={{
                                                    height: '20px',
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        ) : (
                                            <Chip
                                                label="SANTÉ OK"
                                                size="small"
                                                color="success"
                                                icon={<CheckCircle />}
                                                sx={{
                                                    height: '20px',
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{ mb: 1 }} />

                                    {/* --- SI EN PANNE : AFFICHAGE ALERTE --- */}
                                    {item.en_panne ? (
                                        <Box
                                            sx={{
                                                p: 1,
                                                bgcolor: '#fff5f5',
                                                borderRadius: 1,
                                                border: '1px dashed #f44336',
                                            }}
                                        >
                                            <Warning
                                                sx={{
                                                    color: '#f44336',
                                                    fontSize: '2rem',
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    color: '#d32f2f',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                MAINTENANCE REQUISE
                                            </Typography>
                                        </Box>
                                    ) : (
                                        /* --- SI FONCTIONNE : CHRONO --- */
                                        <Box>
                                            {item.etat_actuel ? (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '45px',
                                                            height: '45px',
                                                            borderRadius: '50%',
                                                            border: `3px solid ${couleurFeu}`,
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            bgcolor: '#fdfdfd',
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    'bold',
                                                                fontSize:
                                                                    '1.1rem',
                                                            }}
                                                        >
                                                            {
                                                                item.temps_avant_changement
                                                            }
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={item.etat_actuel}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor:
                                                                couleurFeu,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#666' }}
                                                >
                                                    {item.places_totales
                                                        ? `🅿️ Places: ${item.places_occupees}/${item.places_totales}`
                                                        : `🚗 Vitesse: ${item.vitesse} km/h`}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            mt: 1,
                                            color: '#999',
                                            fontSize: '0.65rem',
                                        }}
                                    >
                                        ID: {item.id_technique || item.id}
                                    </Typography>
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
