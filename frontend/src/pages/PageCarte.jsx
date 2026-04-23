import React, { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    InputAdornment,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
} from '@mui/material';
import {
    Search,
    History,
    Close,
    DirectionsBus,
    LocalParking,
    Restaurant,
} from '@mui/icons-material';
import Carte from '../components/Carte';

const PageCarte = () => {
    const location = useLocation();

    // ÉTATS
    const [vehicules, setVehicules] = useState([]);
    const [termeFixe, setTermeFixe] = useState('');
    const [chargement, setChargement] = useState(false);
    const [aucunResultat, setAucunResultat] = useState(false);
    const [rechercheActive, setRechercheActive] = useState(
        () => location.state?.focusRecherche ?? false,
    );
    const [recherche, setRecherche] = useState(
        () => location.state?.texteInitial ?? '',
    );

    const inputRef = useRef(null);

    // FONCTION API
    const chargerDonnees = async (categorie = 'vehicules', texte = '') => {
        setChargement(true);
        setAucunResultat(false);
        setTermeFixe(texte);

        try {
            let url = `http://localhost:8000/api-map/${categorie}/?search=${texte}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            // On stocke les données
            setVehicules(data);

            // Si la liste est vide, on active l'alerte
            if (data.length === 0) {
                setAucunResultat(true);
            } else {
                setRechercheActive(false); // On ferme le menu seulement si on a trouvé
            }
        } catch (error) {
            console.error('Erreur API:', error);
            setAucunResultat(true); // On affiche aussi "aucun résultat" en cas de plantage
        } finally {
            setChargement(false);
        }
    };

    // EFFETS
    useLayoutEffect(() => {
        if (location.state?.focusRecherche) {
            const texteInitial = location.state?.texteInitial;
            window.history.replaceState({}, document.title);

            setTimeout(() => {
                inputRef.current?.focus();

                if (texteInitial) {
                    chargerDonnees('vehicules', texteInitial);
                }
            }, 0);
        }
    }, [location]);

    const historique = [
        'Gare de Cergy Préfecture',
        'ESSEC Business School',
        'Centre Commercial Trois Fontaines',
    ];

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'white',
            }}
        >
            {/* --- LA CARTE --- */}
            <Box
                sx={{
                    flex: 1,
                    zIndex: 0,
                    filter: rechercheActive ? 'blur(2px)' : 'none',
                    transition: 'filter 0.3s',
                }}
            >
                {/* On pourra passer les véhicules à la carte plus tard pour afficher les marqueurs */}
                <Carte donnees={vehicules} />
            </Box>

            {/* --- ZONE DE RECHERCHE --- */}
            <Paper
                elevation={rechercheActive ? 0 : 3}
                sx={{
                    position: 'absolute',
                    top: rechercheActive ? 0 : 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: rechercheActive ? '100%' : '90%',
                    maxWidth: rechercheActive ? 'none' : 600,
                    borderRadius: rechercheActive ? 0 : 30,
                    bgcolor: 'white',
                    pt: rechercheActive ? 2 : 0,
                    zIndex: 1000,
                    transition: 'all 0.3s ease-in-out',
                    minHeight: rechercheActive ? '100vh' : 'auto',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        mb: rechercheActive ? 2 : 0,
                    }}
                >
                    {rechercheActive && (
                        <IconButton
                            onClick={() => setRechercheActive(false)}
                            sx={{ mr: 1 }}
                        >
                            <Close />
                        </IconButton>
                    )}
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Rechercher à Cergy..."
                        inputRef={inputRef}
                        onFocus={() => setRechercheActive(true)}
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        // Déclenche la recherche sur "Entrée"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter')
                                chargerDonnees('vehicules', recherche);
                        }}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: !rechercheActive && (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ py: 1.5 }}
                    />
                </Box>

                {rechercheActive && (
                    <Box sx={{ px: 2, animation: 'fadeIn 0.3s' }}>
                        {/* Loader pendant l'attente */}
                        {chargement && (
                            <Typography
                                sx={{
                                    py: 2,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                Recherche en cours...
                            </Typography>
                        )}
                        {/* Message Aucun résultat */}
                        {aucunResultat && !chargement && (
                            <Paper
                                sx={{
                                    p: 2,
                                    mt: 1,
                                    bgcolor: '#fff5f5',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography color="error" variant="body2">
                                    Désolé, nous n'avons rien trouvé pour "
                                    <strong>{termeFixe}</strong>".
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Vérifiez l'orthographe ou essayez une autre
                                    catégorie.
                                </Typography>
                            </Paper>
                        )}
                        {/* 1. Les Filtres - On appelle l'API au clic */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                mb: 3,
                                overflowX: 'auto',
                                pb: 1,
                            }}
                        >
                            <Chip
                                icon={<DirectionsBus />}
                                label="Bus"
                                onClick={() => chargerDonnees('vehicules')}
                                clickable
                            />
                            <Chip
                                icon={<LocalParking />}
                                label="Parkings"
                                onClick={() => chargerDonnees('parking')}
                                clickable
                            />
                            <Chip
                                icon={<Restaurant />} // TODO: modif icone
                                label="Incidents"
                                onClick={() => chargerDonnees('incidents')}
                                clickable
                            />
                        </Box>

                        <Typography
                            variant="overline"
                            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                        >
                            Recherches récentes
                        </Typography>
                        <List>
                            {historique.map((item, index) => (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setRecherche(item);
                                        chargerDonnees(item);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <History fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PageCarte;
