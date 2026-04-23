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
    Stack,
} from '@mui/material';
import {
    Search,
    History,
    Close,
    DirectionsBus,
    LocalParking,
    Traffic,
    ReportProblem,
    Map as MapIcon,
} from '@mui/icons-material';
import Carte from '../components/Carte';

const PageCarte = () => {
    const location = useLocation();

    // --- ÉTATS ---
    const [donneesMap, setDonneesMap] = useState([]); // Contiendra tous les objets (Vélos, Feux, etc.)
    const [termeFixe, setTermeFixe] = useState('');
    const [chargement, setChargement] = useState(false);
    const [aucunResultat, setAucunResultat] = useState(false);
    const [rechercheActive, setRechercheActive] = useState(
        () => location.state?.focusRecherche ?? false,
    );
    const [recherche, setRecherche] = useState(
        () => location.state?.texteInitial ?? '',
    );

    // On commence par "global" pour charger toute la ville d'un coup
    const [categorieActuelle, setCategorieActuelle] = useState('global');

    const inputRef = useRef(null);

    // --- FONCTION DE CHARGEMENT API ---
    const chargerDonnees = async (categorie = 'global', texte = '') => {
        // On affiche le chargement seulement si on n'a pas encore de données
        if (donneesMap.length === 0) setChargement(true);

        setAucunResultat(false);
        setTermeFixe(texte);
        setCategorieActuelle(categorie);

        try {
            // Détermination de l'URL (si global on tape /global/, sinon /categorie/)
            const endpoint = categorie === 'global' ? 'global' : categorie;
            let url = `http://localhost:8000/api-map/${endpoint}/?search=${texte}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            setDonneesMap(data);

            if (data.length === 0 && texte !== '') {
                setAucunResultat(true);
            }
        } catch (error) {
            console.error('Erreur API:', error);
            if (donneesMap.length === 0) setAucunResultat(true);
        } finally {
            setChargement(false);
        }
    };

    // --- TEMPS RÉEL (Refresh toutes les 5 secondes) ---
    useEffect(() => {
        const intervalle = setInterval(() => {
            chargerDonnees(categorieActuelle, recherche);
        }, 5000);

        return () => clearInterval(intervalle);
    }, [categorieActuelle, recherche]);

    // --- EFFETS AU DÉMARRAGE ---
    useLayoutEffect(() => {
        if (location.state?.focusRecherche) {
            const texteInitial = location.state?.texteInitial;
            window.history.replaceState({}, document.title);

            setTimeout(() => {
                inputRef.current?.focus();
                if (texteInitial) {
                    chargerDonnees('global', texteInitial);
                }
            }, 0);
        } else {
            // Charge toute la ville par défaut
            chargerDonnees('global', '');
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
                <Carte donnees={donneesMap} />
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
                        placeholder="Rechercher un objet, une rue..."
                        inputRef={inputRef}
                        onFocus={() => setRechercheActive(true)}
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                chargerDonnees(categorieActuelle, recherche);
                                setRechercheActive(false);
                                inputRef.current?.blur();
                            }
                        }}
                        slotProps={{
                            input: {
                                disableUnderline: true,
                                startAdornment: !rechercheActive && (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ py: 1.5 }}
                    />
                </Box>

                {rechercheActive && (
                    <Box sx={{ px: 2, animation: 'fadeIn 0.3s' }}>
                        {/* FILTRES PAR CATÉGORIE */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mb: 3, overflowX: 'auto', pb: 1 }}
                        >
                            <Chip
                                icon={<MapIcon />}
                                label="Toute la ville"
                                onClick={() => {
                                    chargerDonnees('global');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'global'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<DirectionsBus />}
                                label="Bus & Vélibs"
                                onClick={() => {
                                    chargerDonnees('vehicules');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'vehicules'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<LocalParking />}
                                label="Parkings"
                                onClick={() => {
                                    chargerDonnees('parkings');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'parkings'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<Traffic />}
                                label="Feux"
                                onClick={() => {
                                    chargerDonnees('feux');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'feux'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                        </Stack>

                        {chargement && donneesMap.length === 0 && (
                            <Typography
                                sx={{
                                    py: 2,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                Analyse de la ville en cours...
                            </Typography>
                        )}

                        {aucunResultat && (
                            <Paper
                                sx={{
                                    p: 2,
                                    mt: 1,
                                    bgcolor: '#fff5f5',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography color="error" variant="body2">
                                    Aucun objet trouvé pour "
                                    <strong>{termeFixe}</strong>".
                                </Typography>
                            </Paper>
                        )}

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
                                        chargerDonnees('global', item);
                                        setRechercheActive(false);
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
