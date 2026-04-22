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

    const [rechercheActive, setRechercheActive] = useState(
        () => location.state?.focusRecherche ?? false,
    );
    const [recherche, setRecherche] = useState(
        () => location.state?.texteInitial ?? '',
    );
    // Création de la référence pour le champ de recherche
    const inputRef = useRef(null);

    useLayoutEffect(() => {
        if (location.state?.focusRecherche) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 0);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Simulation d'historique
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
                <Carte />
            </Box>

            {/* --- ZONE DE RECHERCHE DYNAMIQUE --- */}
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
                {/* Barre de saisie */}
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

                {/* --- CONTENU QUI S'AFFICHE AU CLIC --- */}
                {rechercheActive && (
                    <Box sx={{ px: 2, animation: 'fadeIn 0.3s' }}>
                        {/* 1. Les Filtres */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                mb: 3,
                                overflowX: 'auto',
                                pb: 1,
                                '&::-webkit-scrollbar': { display: 'none' },
                            }}
                        >
                            <Chip
                                icon={<DirectionsBus />}
                                label="Bus"
                                onClick={() => {}}
                                clickable
                            />
                            <Chip
                                icon={<LocalParking />}
                                label="Parkings"
                                onClick={() => {}}
                                clickable
                            />
                            <Chip
                                icon={<Restaurant />}
                                label="Restos"
                                onClick={() => {}}
                                clickable
                            />
                        </Box>

                        {/* 2. L'Historique */}
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
