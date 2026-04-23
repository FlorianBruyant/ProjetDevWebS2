import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
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
    // On garde en mémoire la catégorie actuelle pour le temps réel
    const [categorieActuelle, setCategorieActuelle] = useState('vehicules');

    const inputRef = useRef(null);

    // FONCTION API
    const chargerDonnees = async (categorie = 'vehicules', texte = '') => {
        // On évite de faire clignoter le message "chargement" à chaque mise à jour auto
        if (vehicules.length === 0) setChargement(true);

        setAucunResultat(false);
        setTermeFixe(texte);
        setCategorieActuelle(categorie);

        try {
            let url = `http://localhost:8000/api-map/${categorie}/?search=${texte}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            setVehicules(data);

            if (data.length === 0 && texte !== '') {
                setAucunResultat(true);
            } else {
                // Ne fermer la recherche que si c'est une action manuelle
                if (chargement) setRechercheActive(false);
            }
        } catch (error) {
            console.error('Erreur API:', error);
            if (vehicules.length === 0) setAucunResultat(true);
        } finally {
            setChargement(false);
        }
    };

    // 🕒 LE TEMPS RÉEL EST ICI : Mise à jour toutes les 5 secondes
    useEffect(() => {
        const intervalle = setInterval(() => {
            chargerDonnees(categorieActuelle, recherche);
        }, 5000);

        return () => clearInterval(intervalle);
    }, [categorieActuelle, recherche]);

    // EFFETS AU DEMARRAGE
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
        } else {
            // 🚨 TRÈS IMPORTANT : Charge les véhicules dès qu'on arrive sur la page !
            chargerDonnees('vehicules', '');
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
                        placeholder="Rechercher..."
                        inputRef={inputRef}
                        onFocus={() => setRechercheActive(true)}
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                chargerDonnees('vehicules', recherche);
                                setRechercheActive(false);
                                // On enlève le focus du champ pour cacher le clavier sur mobile
                                inputRef.current?.blur();
                            }
                        }}
                        slotProps={{
                            input: {
                                disableUnderline: true,
                                startAdornment: !rechercheActive ? (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                        sx={{ py: 1.5 }}
                    />
                </Box>

                {rechercheActive && (
                    <Box sx={{ px: 2, animation: 'fadeIn 0.3s' }}>
                        {chargement && vehicules.length === 0 && (
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
                        {aucunResultat && vehicules.length === 0 && (
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
                            </Paper>
                        )}
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
                                label="Bus & Vélibs"
                                onClick={() => chargerDonnees('vehicules')}
                                clickable
                            />
                            <Chip
                                icon={<LocalParking />}
                                label="Parkings"
                                onClick={() => chargerDonnees('parkings')} // 🚨 Correction URL (parkings)
                                clickable
                            />
                            <Chip
                                icon={<Restaurant />}
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
                                        chargerDonnees('vehicules', item);
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
