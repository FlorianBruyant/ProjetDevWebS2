import React, { useEffect } from 'react';
import { Box, Typography, Chip, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

// --- 🛠️ LA FABRIQUE D'ICÔNES DYNAMIQUES (STABILISÉE) ---
const creerIconeSmart = (item) => {
    let IconeMUI = DirectionsBus;
    let couleur = '#1a237e';

    // On utilise le type_api que j'ai ajouté dans views.py pour fixer l'icône
    switch (item.type_api) {
        case 'feux':
            IconeMUI = Traffic;
            if (item.etat_actuel === 'VERT') couleur = '#4caf50';
            else if (item.etat_actuel === 'ORANGE') couleur = '#ff9800';
            else couleur = '#f44336';
            break;
        case 'parkings':
            IconeMUI = LocalParking;
            couleur = '#455a64';
            break;
        case 'vehicules':
            // Si c'est un véhicule, on regarde s'il y a une plaque pour mettre une voiture, sinon bus
            IconeMUI = item.immatriculation ? DirectionsCar : DirectionsBus;
            couleur = '#2e7d32';
            break;
        default:
            IconeMUI = Warning;
            couleur = '#d32f2f';
    }

    // Si l'objet est marqué en panne ou inactif, il devient GRIS
    if (item.en_panne || item.est_actif === false) {
        couleur = '#9e9e9e';
    }

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
    const navigate = useNavigate();
    const positionCergy = [49.0351, 2.0799];

    const extrairePosition = (item) => {
        const coords = item.point_actuel_details || item.position;
        if (coords && coords.latitude && coords.longitude) {
            return [parseFloat(coords.latitude), parseFloat(coords.longitude)];
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
                            key={`${item.type_api}-${item.id}`}
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

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            mb: 1,
                                        }}
                                    >
                                        <Chip
                                            label={
                                                item.en_panne
                                                    ? 'MAINTENANCE'
                                                    : item.est_actif === false
                                                      ? 'INACTIF'
                                                      : 'SANTÉ OK'
                                            }
                                            size="small"
                                            color={
                                                item.en_panne ||
                                                item.est_actif === false
                                                    ? 'error'
                                                    : 'success'
                                            }
                                            icon={
                                                item.en_panne ? (
                                                    <ErrorIcon />
                                                ) : (
                                                    <CheckCircle />
                                                )
                                            }
                                            sx={{
                                                height: '20px',
                                                fontSize: '0.7rem',
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ mb: 1 }} />

                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        Type: {item.type_api}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        fullWidth
                                        sx={{
                                            mt: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                        }}
                                        onClick={() =>
                                            navigate(
                                                `/objet/${item.type_api}/${item.id}`,
                                            )
                                        }
                                    >
                                        Gérer cet objet
                                    </Button>
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
