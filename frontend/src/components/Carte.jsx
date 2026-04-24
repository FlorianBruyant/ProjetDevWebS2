import React, { useEffect, memo } from 'react';
import { Box, Typography, Chip, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Import des icônes
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

const creerIconeSmart = (item) => {
    let IconeMUI = DirectionsBus;
    let couleur = '#1a237e';

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
            IconeMUI = item.immatriculation ? DirectionsCar : DirectionsBus;
            couleur = '#2e7d32';
            break;
        default:
            IconeMUI = Warning;
            couleur = '#d32f2f';
    }

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

// --- RECENTREUR AUTOMATIQUE ---
const RecentreurDeCarte = ({ donnees, doitCentrer }) => {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();

        // On ne recentre QUE si doitCentrer est vrai (nouvelle recherche)
        if (doitCentrer && donnees && donnees.length > 0) {
            const premier = donnees[0];
            const coords = premier.point_actuel_details || premier.position;

            if (coords && coords.latitude && coords.longitude) {
                map.panTo([coords.latitude, coords.longitude]);
            }
        }
    }, [donnees, doitCentrer, map]); // On ajoute doitCentrer aux dépendances

    return null;
};

// --- CAPTEUR DE CLICS ---
const GestionnaireClic = ({ enModeAjout, auClic }) => {
    useMapEvents({
        click(e) {
            if (enModeAjout && auClic) {
                auClic(e.latlng);
            }
        },
    });
    return null;
};

// --- COMPOSANT PRINCIPAL CARTE ---
const Carte = ({
    hauteur = '100%',
    donnees = [],
    enModeAjout = false,
    auClicCarte,
    doitCentrer = true,
}) => {
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
        <Box
            sx={{
                height: hauteur,
                width: '100%',
                overflow: 'hidden',
                cursor: enModeAjout ? 'crosshair' : 'grab',
            }}
        >
            <MapContainer
                center={positionCergy}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* On passe le flag de contrôle ici */}
                <RecentreurDeCarte
                    donnees={donnees}
                    doitCentrer={doitCentrer}
                />

                <GestionnaireClic
                    enModeAjout={enModeAjout}
                    auClic={auClicCarte}
                />

                {(donnees || []).map((item) => {
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
                                        {item.nom || item.type_incident}
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

// On utilise memo pour éviter que la carte ne re-render
// quand on tape dans la barre de recherche ou ouvre un modal
export default memo(Carte);
